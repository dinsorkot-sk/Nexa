import { getEntityBySlug } from './_entity-utils'
import { restoreOne } from '../../engine/query'

export default defineEventHandler(async (event) => {
  const entity = await getEntityBySlug(event)
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id query param required' })

  const action = query.action
  if (action === 'restore') {
    const restored = await restoreOne(db, entity.tableName, id)
    return restored || { success: false, message: 'Record not found' }
  }
  throw createError({ statusCode: 400, statusMessage: 'Invalid action. Use ?action=restore to restore.' })
})
