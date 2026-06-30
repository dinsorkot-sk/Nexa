import { getEntityBySlug, getFieldsForEntity, validateBody } from './_entity-utils'
import { createOne } from '../../engine/query'

export default defineEventHandler(async (event) => {
  const entity = await getEntityBySlug(event)
  const body = await readBody(event)
  const fields = await getFieldsForEntity(entity.id)
  const data = await validateBody(body, fields)
  return createOne(db, entity.tableName, data)
})
