import { getEntityBySlug, getFieldsForEntity, validateBody } from './_entity-utils'
import { updateOne } from '../../engine/query'

export default defineEventHandler(async (event) => {
  const entity = await getEntityBySlug(event)
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id query param required' })

  const body = await readBody(event)
  const fields = await getFieldsForEntity(entity.id)
  const data = await validateBody(body, fields)
  return updateOne(db, entity.tableName, id, data)
})
