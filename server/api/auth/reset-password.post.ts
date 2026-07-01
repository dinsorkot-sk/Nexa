import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { hashPassword } from '~~/server/utils/auth'
import { z } from 'zod'

const bodySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  // Find the reset token
  const [reset] = await db
    .select()
    .from(schema.passwordResets)
    .where(eq(schema.passwordResets.token, body.token))
    .limit(1)

  if (!reset) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid reset token' })
  }

  if (reset.usedAt) {
    throw createError({ statusCode: 400, statusMessage: 'Reset token has already been used' })
  }

  if (reset.expiresAt < new Date().toISOString()) {
    throw createError({ statusCode: 400, statusMessage: 'Reset token has expired' })
  }

  // Update password
  await db.update(schema.users)
    .set({ passwordHash: hashPassword(body.password) })
    .where(eq(schema.users.id, reset.userId))
    .run()

  // Mark token as used
  await db.update(schema.passwordResets)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(schema.passwordResets.id, reset.id))
    .run()

  // Log the event
  await db.insert(schema.authEvents).values({
    eventType: 'password-reset.completed',
    actor: `user:${reset.userId}`
  })

  return { success: true, message: 'Password has been reset. You can now log in.' }
})
