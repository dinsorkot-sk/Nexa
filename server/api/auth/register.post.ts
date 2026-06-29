import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { hashPassword } from '~~/server/utils/auth'
import { createSession } from '~~/server/utils/session'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

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
      isActive: true
    })
    .returning()
    .all()

  // Assign default 'member' role if it exists
  const [memberRole] = await db
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.slug, 'member'))
    .limit(1)

  if (memberRole) {
    await db.insert(schema.userRoles).values({
      userId: user!.id,
      roleId: memberRole.id
    })
  }

  // Create session
  const session = await createSession(event, user!.id)

  return {
    id: user!.id,
    name: user!.name,
    email: user!.email,
    roles: memberRole ? [{ slug: 'member' }] : [],
    ...session
  }
})
