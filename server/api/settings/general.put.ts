import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { saveAppConfig } from '~~/server/utils/app-config'
import { z } from 'zod'

const bodySchema = z.object({
  siteName: z.string().min(1),
  locale: z.string().min(1),
  timezone: z.string().min(1),
  logoUrl: z.string().nullable()
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  await saveAppConfig(body, userId)

  await db.insert(schema.authEvents).values({
    eventType: 'settings.general.updated',
    actor: `user:${userId}`,
    metadata: JSON.stringify(body)
  })

  return { success: true }
})
