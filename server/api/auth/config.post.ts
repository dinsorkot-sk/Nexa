import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { saveAuthConfig } from '~~/server/utils/auth-config'
import { z } from 'zod'

const bodySchema = z.object({
  providers: z.object({
    password: z.boolean(),
    oauth2: z.boolean(),
    saml: z.boolean()
  }),
  session: z.object({
    absoluteTimeout: z.number().min(1),
    idleTimeout: z.number().min(1),
    refreshTokenTTL: z.number().min(1)
  }),
  security: z.object({
    concurrentSessions: z.boolean(),
    mfaEnabled: z.boolean()
  })
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  await saveAuthConfig(body, userId)

  // Log the event
  await db.insert(schema.authEvents).values({
    eventType: 'config.updated',
    actor: `user:${userId}`,
    metadata: JSON.stringify(body)
  })

  return { success: true }
})
