import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import type { DrizzleDb } from '../../../engine/sync'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid field ID is required' })

  const body = await readBody(event)
  const result = await db.update(schema.fields)
    .set({
      name: body.name,
      slug: body.slug,
      fieldType: body.fieldType,
      isRequired: body.isRequired,
      isUnique: body.isUnique,
      defaultValue: body.defaultValue,
      options: body.options,
      validationRules: body.validationRules,
      sortOrder: body.sortOrder,
      isActive: body.isActive
    })
    .where(eq(schema.fields.id, id))
    .returning().get()
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Field not found' })

  const field = await db.select().from(schema.fields).where(eq(schema.fields.id, id)).get()
  const entity = field ? await db.select().from(schema.entities).where(eq(schema.entities.id, field.entityId)).get() : null
  if (entity && field) {
    try {
      const { syncField } = await import('../../../engine/sync')
      const { invalidateRelationCache } = await import('../../../engine/query')
      await syncField(db as DrizzleDb, { tableName: entity.tableName, slug: entity.slug }, {
        slug: field.slug,
        fieldType: field.fieldType || 'text',
        isRequired: !!field.isRequired,
        isUnique: !!field.isUnique
      })
      invalidateRelationCache()
    } catch { /* ignore */ }
  }

  return result
})
