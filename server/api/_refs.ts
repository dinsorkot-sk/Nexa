import { and, eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const method = event.method

  const query = getQuery(event)
  const sourceEntity = query.source_entity as string | undefined
  const sourceId = query.source_id ? parseInt(query.source_id as string) : undefined
  const refType = query.ref_type as string | undefined

  const conditions = []
  if (sourceEntity) conditions.push(eq(schema.genericReferences.sourceEntity, sourceEntity))
  if (sourceId) conditions.push(eq(schema.genericReferences.sourceId, sourceId))
  if (refType) conditions.push(eq(schema.genericReferences.refType, refType))

  switch (method) {
    case 'GET': {
      if (conditions.length === 0) {
        return await db.select().from(schema.genericReferences).all()
      }
      return await db.select().from(schema.genericReferences).where(and(...conditions)).all()
    }
    case 'POST': {
      const body = await readBody(event)
      const result = await db.insert(schema.genericReferences).values({
        sourceEntity: body.source_entity,
        sourceId: body.source_id,
        refType: body.ref_type,
        data: body.data ? JSON.stringify(body.data) : '{}',
        createdBy: body.created_by
      }).returning().get()
      return result
    }
    case 'DELETE': {
      const id = query.id ? parseInt(query.id as string) : undefined
      if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
      await db.delete(schema.genericReferences).where(eq(schema.genericReferences.id, id)).run()
      return { success: true }
    }
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
