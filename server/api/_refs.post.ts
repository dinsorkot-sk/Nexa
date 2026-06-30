import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await db.insert(schema.genericReferences).values({
    sourceEntity: body.source_entity,
    sourceId: body.source_id,
    refType: body.ref_type,
    data: body.data ? JSON.stringify(body.data) : '{}',
    createdBy: body.created_by
  }).returning().get()
})
