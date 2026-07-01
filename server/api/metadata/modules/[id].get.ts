import { db, schema } from '@nuxthub/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid module ID is required' })

  const mod = await db.get(
    sql`SELECT m.id, m.name, m.slug, m.description, m.icon, m.color, m.category, m.version, m.is_active, m.created_at, m.updated_at,
      (SELECT COUNT(*) FROM _entities WHERE _entities.module_id = m.id) as "entityCount"
      FROM _modules m WHERE m.id = ${id}`
  ) as Record<string, unknown> | undefined
  if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
  const entities = await db.select().from(schema.entities)
    .where(eq(schema.entities.moduleId, id)).all()
  const fieldCounts = await db.all(
    sql`SELECT f.entity_id as "entityId", COUNT(*) as "count" FROM _fields f
      WHERE f.entity_id IN (SELECT e.id FROM _entities e WHERE e.module_id = ${id})
      GROUP BY f.entity_id`
  )
  return { ...mod, isActive: !!mod.isActive, entities, fieldCounts }
})
