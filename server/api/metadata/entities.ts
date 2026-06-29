import { db, schema } from '@nuxthub/db'

/** GET /api/metadata/entities — list all entities */
export default defineEventHandler(async (event) => {
  const method = event.method

  switch (method) {
    case 'GET': {
      const list = await db.select().from(schema.entities).all()
      return list
    }
    case 'POST': {
      const body = await readBody(event)
      // Validate required fields
      if (!body.name || !body.slug || !body.tableName) {
        throw createError({ statusCode: 400, statusMessage: 'name, slug, and tableName are required' })
      }
      const result = await db.insert(schema.entities).values({
        name: body.name,
        slug: body.slug,
        tableName: body.tableName,
        description: body.description || null,
        icon: body.icon || null,
        moduleId: body.moduleId || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }).returning().get()
      return result
    }
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
