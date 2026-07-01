import { db, schema } from '@nuxthub/db'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const sessionId = Number(getRouterParam(event, 'id'))

  if (!Number.isFinite(sessionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid session id' })
  }

  // Can only delete your own sessions
  const [session] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(and(
      eq(schema.sessions.id, sessionId),
      eq(schema.sessions.userId, userId)
    ))
    .limit(1)

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId))

  return { success: true }
})
