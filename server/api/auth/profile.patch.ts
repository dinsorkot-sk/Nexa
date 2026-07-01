import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  avatarUrl: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  // Check email uniqueness if changing
  if (body.email) {
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .limit(1)

    if (existing && existing.id !== userId) {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }
  }

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.email !== undefined) updates.email = body.email
  if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  await db.update(schema.users)
    .set(updates)
    .where(eq(schema.users.id, userId))
    .run()

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  return {
    id: user!.id,
    name: user!.name,
    email: user!.email,
    avatarUrl: user!.avatarUrl,
    isActive: user!.isActive
  }
})
