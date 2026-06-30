import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid entity ID is required' })

  const body = await readBody(event)
  const entity = await db.update(schema.entities)
    .set({
      name: body.name,
      slug: body.slug,
      tableName: body.tableName,
      description: body.description,
      icon: body.icon,
      moduleId: body.moduleId,
      isActive: body.isActive,
      updatedAt: 'datetime(\'now\')'
    })
    .where(eq(schema.entities.id, id))
    .returning().get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: 'Entity not found' })
  return entity
})
