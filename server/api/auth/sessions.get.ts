import { db, schema } from '@nuxthub/db'
import { desc, eq } from 'drizzle-orm'
import { requireAuth } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  const userSessions = await db
    .select({
      id: schema.sessions.id,
      createdAt: schema.sessions.createdAt,
      expiresAt: schema.sessions.expiresAt
    })
    .from(schema.sessions)
    .where(eq(schema.sessions.userId, userId))
    .orderBy(desc(schema.sessions.createdAt))
    .all()

  return userSessions.map(s => ({
    id: s.id,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: false // caller can mark current session
  }))
})
