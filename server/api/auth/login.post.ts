import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '~~/server/utils/auth'
import { createSession } from '~~/server/utils/session'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, body.email))
    .limit(1)

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  if (!user.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Account is disabled' })
  }

  // Get roles
  const userRoles = await db
    .select({ slug: schema.roles.slug, name: schema.roles.name })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .where(eq(schema.userRoles.userId, user.id))

  // Create session
  const session = await createSession(event, user.id)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roles: userRoles,
    ...session
  }
})
