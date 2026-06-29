import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'
import { generateInviteToken } from '~~/server/utils/auth'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email('Invalid email'),
  roleSlug: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  // Check if email already registered
  const existingUser = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, body.email))
    .limit(1)

  if (existingUser.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'User already registered' })
  }

  // Look up role if specified
  let roleId: number | undefined
  if (body.roleSlug) {
    const [role] = await db
      .select({ id: schema.roles.id })
      .from(schema.roles)
      .where(eq(schema.roles.slug, body.roleSlug))
      .limit(1)

    if (role) {
      roleId = role.id
    }
  }

  // Create invite
  const token = generateInviteToken()
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString() // 7 days

  await db.insert(schema.invites).values({
    email: body.email,
    token,
    roleId,
    invitedBy: userId,
    expiresAt
  })

  return { success: true, email: body.email, token, expiresAt }
})
