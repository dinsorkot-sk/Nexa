import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid relation ID is required' })

  const body = await readBody(event)
  const result = await db.update(schema.relations)
    .set({
      name: body.name,
      slug: body.slug,
      relationType: body.relationType,
      pivotTable: body.pivotTable,
      foreignKey: body.foreignKey,
      isRequired: body.isRequired,
      onDelete: body.onDelete
    })
    .where(eq(schema.relations.id, id))
    .returning().get()
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Relation not found' })
  return result
})
