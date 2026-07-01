import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { hashPassword } from '~~/server/utils/auth'
import { createSession } from '~~/server/utils/session'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  inviteToken: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  // Invite-based registration only (no public signup)
  if (!body.inviteToken) {
    throw createError({ statusCode: 403, statusMessage: 'Registration requires an invite token' })
  }

  // Validate invite token
  const [invite] = await db
    .select()
    .from(schema.invites)
    .where(eq(schema.invites.token, body.inviteToken))
    .limit(1)

  if (!invite) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite token' })
  }

  if (invite.acceptedAt) {
    throw createError({ statusCode: 400, statusMessage: 'Invite already accepted' })
  }

  if (invite.expiresAt < new Date().toISOString()) {
    throw createError({ statusCode: 400, statusMessage: 'Invite has expired' })
  }

  if (invite.email !== body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email does not match invite' })
  }

  // Check if email already exists
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, body.email))
    .limit(1)

  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  // Create user
  const passwordHash = hashPassword(body.password)
  const [user] = await db
    .insert(schema.users)
    .values({
      name: body.name,
      email: body.email,
      passwordHash,
      isActive: true,
      invitedBy: invite.invitedBy
    })
    .returning()
    .all()

  // Assign role from invite (or default 'member')
  let roleSlug = 'member'
  if (invite.roleId) {
    const [role] = await db
      .select({ slug: schema.roles.slug })
      .from(schema.roles)
      .where(eq(schema.roles.id, invite.roleId))
      .limit(1)
    if (role) roleSlug = role.slug
  }

  const [role] = await db
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.slug, roleSlug))
    .limit(1)

  if (role) {
    await db.insert(schema.userRoles).values({
      userId: user!.id,
      roleId: role.id,
      assignedBy: invite.invitedBy
    })
  }

  // Mark invite as accepted
  await db.update(schema.invites)
    .set({ acceptedAt: new Date().toISOString() })
    .where(eq(schema.invites.id, invite.id))
    .run()

  // Create session
  const session = await createSession(event, user!.id)

  // Log registration
  await db.insert(schema.authEvents).values({
    eventType: 'REGISTER',
    actor: `user:${user!.id}`,
    metadata: JSON.stringify({ name: user!.name, email: user!.email, invitedBy: invite.invitedBy })
  })

  return {
    id: user!.id,
    name: user!.name,
    email: user!.email,
    roles: [{ slug: roleSlug }],
    ...session
  }
})
