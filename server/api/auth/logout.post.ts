import { db, schema } from '@nuxthub/db'
import { destroySession, getCurrentUserId } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = await getCurrentUserId(event)
  if (userId) {
    await db.insert(schema.authEvents).values({
      eventType: 'LOGOUT',
      actor: `user:${userId}`
    })
  }
  await destroySession(event)
  return { success: true }
})
