import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || !body.slug || !body.tableName) {
    throw createError({ statusCode: 400, statusMessage: 'name, slug, and tableName are required' })
  }
  return await db.insert(schema.entities).values({
    name: body.name,
    slug: body.slug,
    tableName: body.tableName,
    description: body.description || null,
    icon: body.icon || null,
    moduleId: body.moduleId || null,
    isActive: body.isActive !== undefined ? body.isActive : true
  }).returning().get()
})
