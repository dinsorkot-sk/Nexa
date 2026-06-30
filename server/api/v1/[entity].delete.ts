import { getEntityBySlug } from './_entity-utils'
import { deleteOne, forceDelete } from '../../engine/query'

export default defineEventHandler(async (event) => {
  const entity = await getEntityBySlug(event)
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id query param required' })

  const hardDelete = query.hard_delete === 'true'
  if (hardDelete) {
    await forceDelete(db, entity.tableName, id)
    return { success: true, message: 'Permanently deleted' }
  }
  await deleteOne(db, entity.tableName, id)
  return { success: true, message: 'Soft deleted' }
})
