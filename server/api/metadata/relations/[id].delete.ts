import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid relation ID is required' })

  await db.delete(schema.relations).where(eq(schema.relations.id, id)).run()
  const { invalidateRelationCache } = await import('../../../engine/query')
  invalidateRelationCache()
  return { success: true }
})
