import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import type { DrizzleDb, RelationDef } from '~/engine/sync'

/** POST /api/metadata/sync/:slug — sync entity schema to actual SQL table */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Entity slug required' })

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.slug, slug)).get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: `Entity "${slug}" not found` })

  const fields = await db.select().from(schema.fields)
    .where(eq(schema.fields.entityId, entity.id as number))
    .all()

  const relations = await db.select().from(schema.relations)
    .where(eq(schema.relations.entityId, entity.id as number))
    .all()

  const { syncEntityAtomic } = await import('../../../engine/sync')

  // Resolve related entity table names for relations
  const relatedEntityIds = [...new Set(relations.map(r => r.relatedEntityId))]
  const relatedEntities = relatedEntityIds.length > 0
    ? await db.select().from(schema.entities).all()
    : []
  const relatedMap = new Map(relatedEntities.map((e: Record<string, unknown>) => [e.id, e]))

  const relationDefs = relations.map(r => ({
    slug: r.slug,
    relationType: r.relationType as RelationDef['relationType'],
    foreignKey: r.foreignKey,
    pivotTable: r.pivotTable,
    relatedTable: (relatedMap.get(r.relatedEntityId) as Record<string, unknown> | undefined)?.tableName as string ?? '',
    entitySlug: entity.slug
  }))

  const fieldDefs = fields.map(f => ({
    slug: f.slug,
    fieldType: f.fieldType,
    isRequired: !!f.isRequired,
    isUnique: !!f.isUnique
  }))

  await syncEntityAtomic(db as DrizzleDb,
    { tableName: entity.tableName, slug: entity.slug },
    fieldDefs,
    relationDefs
  )

  return { success: true, message: `Schema for "${entity.name}" synced` }
})
