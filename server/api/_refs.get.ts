import { and, eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sourceEntity = query.source_entity as string | undefined
  const sourceId = query.source_id ? parseInt(query.source_id as string) : undefined
  const refType = query.ref_type as string | undefined

  const conditions = []
  if (sourceEntity) conditions.push(eq(schema.genericReferences.sourceEntity, sourceEntity))
  if (sourceId) conditions.push(eq(schema.genericReferences.sourceId, sourceId))
  if (refType) conditions.push(eq(schema.genericReferences.refType, refType))

  if (conditions.length === 0) {
    return await db.select().from(schema.genericReferences).all()
  }
  return await db.select().from(schema.genericReferences).where(and(...conditions)).all()
})
