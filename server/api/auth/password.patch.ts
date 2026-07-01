import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { hashPassword, verifyPassword } from '~~/server/utils/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  const [user] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!user || !verifyPassword(body.currentPassword, user.passwordHash)) {
    throw createError({ statusCode: 400, statusMessage: 'Current password is incorrect' })
  }

  await db.update(schema.users)
    .set({ passwordHash: hashPassword(body.newPassword) })
    .where(eq(schema.users.id, userId))
    .run()

  return { success: true }
})
