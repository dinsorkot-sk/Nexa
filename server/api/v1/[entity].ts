import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'
import { findMany, findOne, createOne, updateOne, deleteOne } from '../../engine/query'
import { parseInclude } from '../../engine/include'

export default defineEventHandler(async (event) => {
  const method = event.method
  const entitySlug = getRouterParam(event, 'entity')
  if (!entitySlug) throw createError({ statusCode: 400, statusMessage: 'Entity slug required' })

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.slug, entitySlug)).get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: `Entity "${entitySlug}" not found` })

  const query = getQuery(event)
  const include = parseInclude(query.include as string | undefined)
  const filter = query.filter as Record<string, string> | undefined
  const sort = query.sort as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)

  const opts = {
    include: include.map(i => i.relation),
    filter,
    sort,
    page,
    limit
  }

  const id = query.id ? parseInt(query.id as string) : undefined
  if (id) return handleById(event, db, entity, id, opts)

  switch (method) {
    case 'GET':
      return findMany(db, entity.tableName, entity.slug, opts)
    case 'POST': {
      const body = await readBody(event)
      return createOne(db, entity.tableName, body)
    }
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})

async function handleById(
  event: any,
  _db: any,
  entity: any,
  id: number,
  opts: any
) {
  const method = event.method
  switch (method) {
    case 'GET':
      return findOne(db, entity.tableName, entity.slug, id, opts)
    case 'PUT': {
      const body = await readBody(event)
      return updateOne(db, entity.tableName, id, body)
    }
    case 'DELETE':
      return deleteOne(db, entity.tableName, id)
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
}
