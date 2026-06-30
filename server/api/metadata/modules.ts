import { db, schema } from '@nuxthub/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const method = event.method

  switch (method) {
    case 'GET': {
      const rows = await db.all(
        sql`SELECT m.id, m.name, m.slug, m.description, m.icon, m.is_active, m.created_at, m.updated_at,
          (SELECT COUNT(*) FROM _entities WHERE _entities.module_id = m.id) as "entityCount"
          FROM _modules m`
      )
      return rows.map((r: Record<string, unknown>) => ({ ...r, isActive: !!r.isActive }))
    }
    case 'POST': {
      const body = await readBody(event)
      if (!body.name || !body.slug) {
        throw createError({ statusCode: 400, statusMessage: 'name and slug are required' })
      }
      const result = await db.insert(schema.modules).values({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        icon: body.icon || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }).returning().get()
      return result
    }
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
