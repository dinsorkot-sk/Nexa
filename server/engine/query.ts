import { relations as relationsTable } from '../db/schema/relations'
import { entities } from '../db/schema/metadata'
import type { RelationDef } from './sync'

interface QueryOptions {
  include?: string[]
  filter?: Record<string, string>
  sort?: string
  page?: number
  limit?: number
}

let _rels: RelationDef[] | null = null
const _relMap: Map<string, RelationDef> = new Map()

async function loadRelations(drizzle: any) {
  if (_rels) return

  const rows: any[] = await drizzle.select().from(relationsTable).all()
  const ents: any[] = await drizzle.select().from(entities).all()
  const entMap = new Map(ents.map((e: any) => [e.id, e]))

  const rels: RelationDef[] = rows.map((r: any) => ({
    slug: r.slug,
    relationType: r.relationType as RelationDef['relationType'],
    foreignKey: r.foreignKey,
    pivotTable: r.pivotTable,
    relatedTable: entMap.get(r.relatedEntityId)?.tableName ?? '',
    entitySlug: entMap.get(r.entityId)?.slug ?? ''
  }))
  _rels = rels
  for (const r of rels) _relMap.set(r.slug, r)
}

function raw(db: any): { all<T>(q: string): Promise<T[]>, get<T>(q: string): Promise<T | undefined>, run(q: string): Promise<any> } {
  return db
}

export async function findMany(
  db: any,
  tableName: string,
  entitySlug: string,
  options: QueryOptions
): Promise<{ data: any[], total: number }> {
  await loadRelations(db)

  const includes = options.include || []
  const filter = options.filter || {}
  const sort = options.sort || 'id'
  const page = options.page || 1
  const limit = options.limit || 20
  const offset = (page - 1) * limit

  const orderDir = sort.startsWith('-') ? 'DESC' : 'ASC'
  const sortCol = sort.replace(/^-/, '')

  let joinPart = ''
  let selectFields = `${tableName}.*`

  for (const inc of includes) {
    const rel = _relMap.get(inc)
    if (!rel) continue
    const alias = `_rel_${inc}`
    selectFields += `, ${alias}.*`
    switch (rel.relationType) {
      case '1:N':
        joinPart += ` LEFT JOIN ${rel.relatedTable} AS ${alias} ON ${alias}.${rel.foreignKey || entitySlug + '_id'} = ${tableName}.id`
        break
      case '1:1':
        joinPart += ` LEFT JOIN ${rel.relatedTable} AS ${alias} ON ${alias}.${rel.foreignKey || rel.slug + '_id'} = ${tableName}.id`
        break
      case 'N:N': {
        const pivot = rel.pivotTable || `${entitySlug}_${rel.slug}`
        joinPart += ` LEFT JOIN ${pivot} ON ${pivot}.${entitySlug}_id = ${tableName}.id`
        joinPart += ` LEFT JOIN ${rel.relatedTable} AS ${alias} ON ${alias}.id = ${pivot}.${rel.slug}_id`
        break
      }
      case 'self':
        joinPart += ` LEFT JOIN ${tableName} AS ${alias} ON ${alias}.id = ${tableName}.parent_id`
        break
    }
  }

  let wherePart = ''
  const filterKeys = Object.keys(filter)
  if (filterKeys.length > 0) {
    const clauses = filterKeys.map((k) => {
      const val = filter[k]
      if (val === undefined) return ''
      return `${tableName}.${k} = '${val.replace(/'/g, '\'\'')}'`
    }).filter(Boolean)
    wherePart = ' WHERE ' + clauses.join(' AND ')
  }

  const countSql = `SELECT COUNT(*) as total FROM ${tableName}${joinPart}${wherePart}`
  const dataSql = `SELECT ${selectFields} FROM ${tableName}${joinPart}${wherePart} ORDER BY ${tableName}.${sortCol} ${orderDir} LIMIT ${limit} OFFSET ${offset}`

  const countResult = await raw(db).all<{ total: number }>(countSql)
  const dataResult = await raw(db).all<any>(dataSql)

  const total = countResult.length > 0 ? Number(countResult[0]?.total ?? 0) : 0
  let data = dataResult || []

  if (includes.length > 0) {
    data = nestRelations(data, tableName, includes)
  }

  return { data, total }
}

export async function findOne(
  db: any,
  tableName: string,
  entitySlug: string,
  id: number,
  options: QueryOptions
): Promise<any> {
  const result = await findMany(db, tableName, entitySlug, {
    ...options,
    filter: { ...options.filter, id: String(id) },
    page: 1,
    limit: 1
  })
  return result.data[0] || null
}

export async function createOne(
  db: any,
  tableName: string,
  data: Record<string, any>
): Promise<any> {
  const keys = Object.keys(data).filter(k => k !== 'include')
  const cols = keys.join(', ')
  const vals = keys.map((k) => {
    const v = data[k]
    if (v === undefined || v === null) return 'NULL'
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, '\'\'')}'`
    return `'${String(v).replace(/'/g, '\'\'')}'`
  }).join(', ')

  const sql = `INSERT INTO ${tableName} (${cols}) VALUES (${vals}) RETURNING *`
  return raw(db).get<any>(sql)
}

export async function updateOne(
  db: any,
  tableName: string,
  id: number,
  data: Record<string, any>
): Promise<any> {
  const sets = Object.keys(data)
    .filter(k => k !== 'id' && k !== 'include')
    .map((k) => {
      const v = data[k]
      if (v === undefined || v === null) return `${k} = NULL`
      if (typeof v === 'object') return `${k} = '${JSON.stringify(v).replace(/'/g, '\'\'')}'`
      return `${k} = '${String(v).replace(/'/g, '\'\'')}'`
    })
    .join(', ')

  const sql = `UPDATE ${tableName} SET ${sets}, updated_at = datetime('now') WHERE id = ${id} RETURNING *`
  return raw(db).get<any>(sql)
}

export async function deleteOne(
  db: any,
  tableName: string,
  id: number
): Promise<boolean> {
  await loadRelations(db)
  const fkRels = (_rels || []).filter(
    r => (r.relationType === '1:N' || r.relationType === '1:1') && r.foreignKey
  )
  for (const rel of fkRels) {
    const fk = rel.foreignKey || rel.slug + '_id'
    await raw(db).run(`UPDATE ${rel.relatedTable} SET ${fk} = NULL WHERE ${fk} = ${id}`)
  }
  await raw(db).run(`DELETE FROM ${tableName} WHERE id = ${id}`)
  return true
}

function nestRelations(rows: any[], tableName: string, includes: string[]): any[] {
  const grouped: Record<number, any> = {}
  for (const row of rows) {
    const id = row.id
    if (!grouped[id]) {
      grouped[id] = { ...row }
      for (const inc of includes) {
        const rel = _relMap.get(inc)
        if (!rel) continue
        grouped[id][inc] = rel.relationType === '1:N' ? [] : null
      }
    }
    for (const inc of includes) {
      const rel = _relMap.get(inc)
      if (!rel) continue
      const relRow: Record<string, any> = {}
      let hasData = false
      for (const key of Object.keys(row)) {
        if (key.startsWith(`_rel_${inc}_`)) {
          const actualKey = key.slice(`_rel_${inc}_`.length)
          relRow[actualKey] = row[key]
          if (row[key] !== null) hasData = true
        }
      }
      if (hasData && rel.relationType === '1:N') {
        if (!grouped[id][inc].some((r: any) => r.id === relRow.id)) {
          grouped[id][inc].push(relRow)
        }
      } else if (hasData) {
        grouped[id][inc] = relRow
      }
    }
  }
  return Object.values(grouped)
}
