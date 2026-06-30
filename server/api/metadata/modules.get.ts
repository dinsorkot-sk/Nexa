import { db } from '@nuxthub/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.all(
    sql`SELECT m.id, m.name, m.slug, m.description, m.icon, m.is_active, m.created_at, m.updated_at,
      (SELECT COUNT(*) FROM _entities WHERE _entities.module_id = m.id) as "entityCount"
      FROM _modules m`
  )
  return (rows as Record<string, unknown>[]).map(r => ({ ...r, isActive: !!r.isActive }))
})
