import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { saveNotificationPrefs } from '~~/server/utils/notification-prefs'
import { z } from 'zod'

const bodySchema = z.object({
  emailEnabled: z.boolean(),
  desktopEnabled: z.boolean(),
  weeklyDigest: z.boolean(),
  productUpdates: z.boolean(),
  importantUpdates: z.boolean()
}).partial()

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  await saveNotificationPrefs(userId, body)

  await db.insert(schema.authEvents).values({
    eventType: 'settings.notifications.updated',
    actor: `user:${userId}`
  })

  return { success: true }
})
