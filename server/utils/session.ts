import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { generateToken } from './auth'
import { getCookie, setCookie, deleteCookie, createError } from 'h3'
import type { H3Event } from 'h3'

const SESSION_DURATION_DAYS = 30
const COOKIE_NAME = 'nexa_session'

/**
 * Get the session token from the request cookie.
 */
function getTokenFromEvent(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}

/**
 * Set the session cookie on the response.
 */
function setTokenCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 86400
  })
}

/**
 * Remove the session cookie.
 */
function clearTokenCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

/**
 * Create a new session for a user, set cookie, return session record.
 */
export async function createSession(event: H3Event, userId: number) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 86400000).toISOString()

  await db.insert(schema.sessions).values({
    userId,
    token,
    expiresAt
  })

  setTokenCookie(event, token)

  return { token, expiresAt }
}

/**
 * Get the current user from the session token in the cookie.
 * Returns user id or null if not authenticated.
 */
export async function getCurrentUserId(event: H3Event): Promise<number | null> {
  const token = getTokenFromEvent(event)
  if (!token) return null

  const now = new Date().toISOString()

  const [session] = await db
    .select({ userId: schema.sessions.userId, expiresAt: schema.sessions.expiresAt })
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .limit(1)

  if (!session) return null

  // Check expiry
  if (session.expiresAt < now) {
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token))
    clearTokenCookie(event)
    return null
  }

  return session.userId
}

/**
 * Get the current full user record (with roles).
 */
export async function getCurrentUser(event: H3Event) {
  const userId = await getCurrentUserId(event)
  if (!userId) return null

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!user) return null

  // Get roles
  const userRoles = await db
    .select({
      roleId: schema.userRoles.roleId,
      roleName: schema.roles.name,
      roleSlug: schema.roles.slug
    })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .where(eq(schema.userRoles.userId, userId))

  return {
    ...user,
    passwordHash: undefined, // never expose
    roles: userRoles.map(r => ({ id: r.roleId, name: r.roleName, slug: r.roleSlug }))
  }
}

/**
 * Destroy the current session (logout).
 */
export async function destroySession(event: H3Event) {
  const token = getTokenFromEvent(event)
  if (token) {
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token))
  }
  clearTokenCookie(event)
}

/**
 * Require authentication. Returns user id or throws 401.
 */
export async function requireAuth(event: H3Event): Promise<number> {
  const userId = await getCurrentUserId(event)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return userId
}
