import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

/** PUT|DELETE /api/metadata/relations/:id */
export default defineEventHandler(async (event) => {
  const method = event.method
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid relation ID is required' })
  }

  switch (method) {
    case 'PUT': {
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
    }

    case 'DELETE': {
      await db.delete(schema.relations).where(eq(schema.relations.id, id)).run()
      const { invalidateRelationCache } = await import('../../../engine/query')
      invalidateRelationCache()
      return { success: true }
    }

    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
