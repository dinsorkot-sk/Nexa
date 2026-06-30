import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import type { DrizzleDb, RelationDef } from '../../engine/sync'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.entityId || !body.relatedEntityId || !body.name || !body.slug || !body.relationType) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: entityId, relatedEntityId, name, slug, relationType' })
  }
  if (!['1:1', '1:N', 'N:N', 'self'].includes(body.relationType)) {
    throw createError({ statusCode: 400, statusMessage: 'relationType must be 1:1, 1:N, N:N, or self' })
  }

  const result = await db.insert(schema.relations).values({
    entityId: body.entityId,
    relatedEntityId: body.relatedEntityId,
    name: body.name,
    slug: body.slug,
    relationType: body.relationType,
    pivotTable: body.pivotTable || null,
    foreignKey: body.foreignKey || null,
    isRequired: body.isRequired !== undefined ? body.isRequired : false,
    onDelete: body.onDelete || 'SET NULL'
  }).returning().get()

  if (result) {
    try {
      const entity = await db.select().from(schema.entities).where(eq(schema.entities.id, body.entityId)).get()
      const relatedEntity = await db.select().from(schema.entities).where(eq(schema.entities.id, body.relatedEntityId)).get()
      const { syncRelation } = await import('../../engine/sync')
      await syncRelation(db as DrizzleDb,
        { tableName: entity?.tableName || '', slug: entity?.slug || '' },
        {
          slug: result.slug,
          relationType: result.relationType as RelationDef['relationType'],
          foreignKey: result.foreignKey,
          pivotTable: result.pivotTable,
          relatedTable: relatedEntity?.tableName || '',
          entitySlug: entity?.slug || ''
        }
      )
    } catch { /* ignore */ }
  }

  return result
})
