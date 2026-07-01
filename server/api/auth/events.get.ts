import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { desc, inArray, sql } from 'drizzle-orm'

const PAGE_SIZE = 100

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const search = String(query.search || '').trim().toLowerCase()

  // Build query with optional search filter
  let rows: Array<{
    id: number
    eventType: string
    actor: string | null
    metadata: string | null
    createdAt: string | null
  }>

  if (search) {
    rows = await db
      .select()
      .from(schema.authEvents)
      .where(
        sql`LOWER(event_type) LIKE ${`%${search}%`} OR LOWER(actor) LIKE ${`%${search}%`}`
      )
      .orderBy(desc(schema.authEvents.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)
      .all() as typeof rows
  } else {
    rows = await db
      .select()
      .from(schema.authEvents)
      .orderBy(desc(schema.authEvents.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)
      .all() as typeof rows
  }

  // Extract user IDs from actor fields and batch-fetch user names
  const userIds = new Set<number>()
  rows.forEach((r) => {
    const m = r.actor?.match(/^user:(\d+)$/)
    if (m) userIds.add(Number(m[1]))
  })

  const userMap = new Map<number, { name: string, email: string, avatarUrl: string | null }>()
  if (userIds.size > 0) {
    const users = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, avatarUrl: schema.users.avatarUrl })
      .from(schema.users)
      .where(inArray(schema.users.id, [...userIds]))
      .all()
    users.forEach(u => userMap.set(u.id, { name: u.name, email: u.email, avatarUrl: u.avatarUrl }))
  }

  // Map events to enriched format
  return rows.map((e) => {
    const actorMatch = e.actor?.match(/^user:(\d+)$/)
    const userId = actorMatch ? Number(actorMatch[1]) : null
    const user = userId ? userMap.get(userId) : null
    let parsedMeta: Record<string, unknown> | null = null
    try {
      if (e.metadata) parsedMeta = JSON.parse(e.metadata)
    } catch { /* ignore */ }

    // Determine status based on event type
    let status = 'completed'
    if (e.eventType === 'LOGIN_FAILED') {
      status = 'failed'
    } else if (e.eventType === 'LOGIN') {
      status = 'success'
    }

    return {
      id: e.id,
      timestamp: e.createdAt || new Date().toISOString(),
      eventType: e.eventType,
      actor: e.actor || 'System',
      userId,
      userName: user?.name || null,
      userEmail: user?.email || null,
      userAvatarUrl: user?.avatarUrl || null,
      status,
      metadata: parsedMeta
    }
  })
})
