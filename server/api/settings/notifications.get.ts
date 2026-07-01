import { requireAuth } from '~~/server/utils/session'
import { getNotificationPrefs } from '~~/server/utils/notification-prefs'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  return getNotificationPrefs(userId)
})
