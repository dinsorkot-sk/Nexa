import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid entity ID is required' })

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.id, id)).get()
  if (entity) {
    const { dropEntity } = await import('../../../engine/sync')
    const { invalidateRelationCache } = await import('../../../engine/query')
    try {
      await dropEntity(db, { tableName: entity.tableName, slug: entity.slug })
    } catch { /* ignore */ }
    invalidateRelationCache()
  }
  await db.delete(schema.entities).where(eq(schema.entities.id, id)).run()
  return { success: true }
})
