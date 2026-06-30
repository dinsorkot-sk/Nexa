import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || !body.slug) {
    throw createError({ statusCode: 400, statusMessage: 'name and slug are required' })
  }
  return await db.insert(schema.modules).values({
    name: body.name,
    slug: body.slug,
    description: body.description || null,
    icon: body.icon || null,
    isActive: body.isActive !== undefined ? body.isActive : true
  }).returning().get()
})
