import { getEntityBySlug } from './_entity-utils'
import { findMany, findOne } from '../../engine/query'
import { parseInclude } from '../../engine/include'
import type { QueryOptions } from '../../engine/query'

export default defineEventHandler(async (event) => {
  const entity = await getEntityBySlug(event)

  const query = getQuery(event)
  const include = parseInclude(query.include as string | undefined)
  const filter = query.filter as Record<string, string> | undefined
  const sort = query.sort as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const trash = query.trash === 'true'

  const opts: QueryOptions = {
    include: include.map(i => i.relation),
    filter,
    sort,
    page,
    limit,
    trash
  }

  const id = query.id ? parseInt(query.id as string) : undefined
  if (id) return findOne(db, entity.tableName, entity.slug, id, opts)

  return findMany(db, entity.tableName, entity.slug, opts)
})
