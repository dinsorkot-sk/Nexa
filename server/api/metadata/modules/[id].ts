import { db, schema } from '@nuxthub/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const method = event.method
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid module ID is required' })
  }

  switch (method) {
    case 'GET': {
      const mod = await db.get(
        sql`SELECT m.id, m.name, m.slug, m.description, m.icon, m.is_active, m.created_at, m.updated_at,
          (SELECT COUNT(*) FROM _entities WHERE _entities.module_id = m.id) as "entityCount"
          FROM _modules m WHERE m.id = ${id}`
      )
      if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
      const entities = await db.select().from(schema.entities)
        .where(eq(schema.entities.moduleId, id)).all()
      const fieldCounts = await db.all(
        sql`SELECT f.entity_id as "entityId", COUNT(*) as "count" FROM _fields f
          WHERE f.entity_id IN (SELECT e.id FROM _entities e WHERE e.module_id = ${id})
          GROUP BY f.entity_id`
      )
      return { ...mod, isActive: !!mod.isActive, entities, fieldCounts }
    }

    case 'PUT': {
      const body = await readBody(event)
      const mod = await db.update(schema.modules)
        .set({
          name: body.name,
          slug: body.slug,
          description: body.description,
          icon: body.icon,
          isActive: body.isActive,
          updatedAt: sql`datetime('now')`
        })
        .where(eq(schema.modules.id, id))
        .returning().get()
      if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
      return mod
    }

    case 'DELETE': {
      const mod = await db.select().from(schema.modules).where(eq(schema.modules.id, id)).get()
      if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
      await db.delete(schema.modules).where(eq(schema.modules.id, id)).run()
      return { success: true }
    }

    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
