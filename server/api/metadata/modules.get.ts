import { db } from '@nuxthub/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.all(
    sql`SELECT m.id, m.name, m.slug, m.description, m.icon, m.color, m.category, m.version, m.is_active, m.created_at, m.updated_at,
      (SELECT COUNT(*) FROM _entities WHERE _entities.module_id = m.id) as "entityCount",
      (SELECT COUNT(*) FROM _fields f JOIN _entities e ON f.entity_id = e.id WHERE e.module_id = m.id) as "formCount"
      FROM _modules m ORDER BY m.updated_at DESC`
  )
  return (rows as Record<string, unknown>[]).map(r => ({ ...r, isActive: !!r.isActive }))
})
