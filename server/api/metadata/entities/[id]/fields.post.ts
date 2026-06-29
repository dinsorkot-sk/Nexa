import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import type { DrizzleDb } from '~/engine/sync'

/** POST /api/metadata/entities/:id/fields — create a new field */
export default defineEventHandler(async (event) => {
  const entityId = parseInt(getRouterParam(event, 'id') || '')
  if (!entityId || isNaN(entityId)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid entity ID required' })
  }

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.id, entityId)).get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: 'Entity not found' })

  const body = await readBody(event)
  if (!body.name || !body.slug || !body.fieldType) {
    throw createError({ statusCode: 400, statusMessage: 'name, slug, and fieldType are required' })
  }

  const result = await db.insert(schema.fields).values({
    entityId,
    name: body.name,
    slug: body.slug,
    fieldType: body.fieldType,
    isRequired: body.isRequired || false,
    isUnique: body.isUnique || false,
    defaultValue: body.defaultValue || null,
    options: body.options || null,
    validationRules: body.validationRules || null,
    sortOrder: body.sortOrder || 0,
    isActive: body.isActive !== undefined ? body.isActive : true
  }).returning().get()

  if (result) {
    try {
      const { syncField } = await import('../../../../engine/sync')
      await syncField(db as DrizzleDb, { tableName: entity.tableName, slug: entity.slug }, {
        slug: result.slug,
        fieldType: result.fieldType,
        isRequired: result.isRequired ?? false,
        isUnique: result.isUnique ?? false
      })
    } catch {
      // Column may already exist
    }
  }

  return result
})
