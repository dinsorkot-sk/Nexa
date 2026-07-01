import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { desc } from 'drizzle-orm'

const PAGE_SIZE = 50

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)

  const events = await db
    .select()
    .from(schema.authEvents)
    .orderBy(desc(schema.authEvents.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .all()

  // Try to parse metadata for display
  return events.map(e => ({
    id: e.id,
    timestamp: e.createdAt,
    eventType: e.eventType,
    actor: e.actor || 'System',
    status: e.metadata ? tryParseStatus(e.metadata) : 'completed'
  }))

  function tryParseStatus(metadata: string): string {
    try {
      const parsed = JSON.parse(metadata)
      return parsed.status || 'completed'
    } catch {
      return 'completed'
    }
  }
})
