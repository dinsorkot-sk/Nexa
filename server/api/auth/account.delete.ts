import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { requireAuth, destroySession } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  // Delete all sessions for this user
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId))

  // Delete user (cascades: sessions, user_roles, notification_prefs, password_resets)
  await db.delete(schema.users).where(eq(schema.users.id, userId))

  // Clear cookie
  await destroySession(event)

  return { success: true }
})
