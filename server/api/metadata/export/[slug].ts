import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Entity slug is required' })

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.slug, slug)).get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: 'Entity not found' })

  const fields = await db.select().from(schema.fields)
    .where(eq(schema.fields.entityId, entity.id))
    .orderBy(schema.fields.sortOrder)
    .all()

  const rels = await db.select().from(schema.relations)
    .where(eq(schema.relations.entityId, entity.id))
    .all()

  const payload = { ...entity, fields, relations: rels }
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Content-Disposition', `attachment; filename="${entity.slug}.json"`)
  return payload
})
