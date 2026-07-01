import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { generateToken } from '~~/server/utils/auth'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email('Invalid email')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  // Find user by email (don't reveal if email exists)
  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, body.email))
    .limit(1)

  if (!user) {
    // Return success anyway to prevent email enumeration
    return { success: true, message: 'If the email exists, a reset link has been sent.' }
  }

  // Invalidate any existing unused tokens for this user
  await db.update(schema.passwordResets)
    .set({ usedAt: new Date(0).toISOString() })
    .where(
      eq(schema.passwordResets.userId, user.id)
    )
    .run()

  // Create new reset token (valid for 1 hour)
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  await db.insert(schema.passwordResets).values({
    userId: user.id,
    token,
    expiresAt
  })

  // Log the event
  await db.insert(schema.authEvents).values({
    eventType: 'password-reset.requested',
    actor: body.email,
    metadata: JSON.stringify({ userId: user.id })
  })

  // Since there's no email transport, return the token directly for dev
  const requestUrl = getRequestURL(event)
  return {
    success: true,
    message: 'If the email exists, a reset link has been sent.',
    resetUrl: `${requestUrl.protocol}//${requestUrl.host}/reset-password?token=${token}`,
    token // exposed for dev – remove in production
  }
})
