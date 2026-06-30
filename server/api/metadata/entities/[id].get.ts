import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid entity ID is required' })

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.id, id)).get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: 'Entity not found' })
  const fields = await db.select().from(schema.fields)
    .where(eq(schema.fields.entityId, id))
    .orderBy(schema.fields.sortOrder)
    .all()
  const rels = await db.select().from(schema.relations)
    .where(eq(schema.relations.entityId, id))
    .all()
  return { ...entity, fields, relations: rels }
})
