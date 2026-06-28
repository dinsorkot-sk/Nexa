import { sql } from 'drizzle-orm'
import { relations as relationsTable } from '../db/schema/relations'
import { entities } from '../db/schema/metadata'
import type { RelationDef } from './sync'

export interface QueryOptions {
  include?: string[]
  filter?: Record<string, string>
  sort?: string
  page?: number
  limit?: number
  trash?: boolean
}

// Minimal interface for the Drizzle db object we use
interface DrizzleDb {
  select(): {
    from(table: unknown): {
      where(condition: unknown): { all(): Promise<Record<string, unknown>[]>; get(): Promise<Record<string, unknown> | undefined> }
      all(): Promise<Record<string, unknown>[]>
    }
  }
  run(query: any): Promise<{ rows?: unknown[]; lastInsertRowid?: bigint }>
  all<T = Record<string, unknown>>(query: any): Promise<T[]>
  get<T = Record<string, unknown>>(query: any): Promise<T | undefined>
}

// ── Safe identifier validation ──────────────────────────────────────────
const IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/

export function safeId(name: string): string {
  if (!IDENTIFIER_RE.test(name)) throw new Error(`Invalid SQL identifier: "${name}"`)
  return name
}

// ── Build a SQL object with parameterised values ─────────────────────────
// Split raw SQL on `?` and interleave values using the sql`` template literal,
// which correctly builds a `SQL` object with Param chunks.
function makeSQL(rawStr: string, vals: any[] = []) {
  const parts = rawStr.split('?')
  let sq = sql.raw(parts[0] || '')
  for (let i = 0; i < vals.length; i++) {
    sq = sql`${sq}${vals[i]}${sql.raw(parts[i + 1] || '')}`
  }
  return sq
}

// ── Module-level relation cache ─────────────────────────────────────────
let _rels: RelationDef[] | null = null
const _relMap: Map<string, RelationDef> = new Map()

export async function loadRelations(drizzle: DrizzleDb) {
  if (_rels) return

  const rows: Record<string, unknown>[] = await drizzle.select().from(relationsTable).all()
  const ents: Record<string, unknown>[] = await drizzle.select().from(entities).all()
  const entMap = new Map(ents.map((e: Record<string, unknown>) => [e.id, e]))

  const rels: RelationDef[] = rows.map((r: Record<string, unknown>) => ({
    slug: r.slug as string,
    relationType: r.relationType as RelationDef['relationType'],
    foreignKey: r.foreignKey as string | null,
    pivotTable: r.pivotTable as string | null,
    relatedTable: (entMap.get(r.relatedEntityId as number) as Record<string, unknown>)?.tableName as string ?? '',
    entitySlug: (entMap.get(r.entityId as number) as Record<string, unknown>)?.slug as string ?? ''
  }))
  _rels = rels
  for (const r of rels) _relMap.set(r.slug, r)
}

/** Force-reload relation cache */
export function invalidateRelationCache() {
  _rels = null
  _relMap.clear()
}

// ── Build parameterised WHERE clause ────────────────────────────────────
function buildWhere(
  filter: Record<string, string>,
  tableName: string,
  includeTrash: boolean
): { clause: string; params: any[] } {
  const conditions: string[] = []
  const params: any[] = []
  const tbl = safeId(tableName)

  if (!includeTrash) {
    conditions.push(`${tbl}.deleted_at IS NULL`)
  }

  for (const [k, v] of Object.entries(filter)) {
    if (v === undefined) continue
    conditions.push(`${tbl}.${safeId(k)} = ?`)
    params.push(v)
  }

  if (conditions.length === 0) return { clause: '', params: [] }
  return { clause: ' WHERE ' + conditions.join(' AND '), params }
}

// ── Join builder ────────────────────────────────────────────────────────
function buildJoin(tableName: string, entitySlug: string, includes: string[]): { joinPart: string; selectFields: string } {
  let joinPart = ''
  let selectFields = `${safeId(tableName)}.*`
  for (const inc of includes) {
    const rel = _relMap.get(inc)
    if (!rel) continue
    const alias = `_rel_${inc}`
    selectFields += `, ${alias}.*`
    switch (rel.relationType) {
      case '1:N':
        joinPart += ` LEFT JOIN ${safeId(rel.relatedTable)} AS ${alias} ON ${alias}.${safeId(rel.foreignKey || entitySlug + '_id')} = ${safeId(tableName)}.id`
        break
      case '1:1':
        joinPart += ` LEFT JOIN ${safeId(rel.relatedTable)} AS ${alias} ON ${alias}.${safeId(rel.foreignKey || rel.slug + '_id')} = ${safeId(tableName)}.id`
        break
      case 'N:N': {
        const pivot = rel.pivotTable || `${entitySlug}_${rel.slug}`
        joinPart += ` LEFT JOIN ${safeId(pivot)} ON ${safeId(pivot)}.${safeId(entitySlug)}_id = ${safeId(tableName)}.id`
        joinPart += ` LEFT JOIN ${safeId(rel.relatedTable)} AS ${alias} ON ${alias}.id = ${safeId(pivot)}.${safeId(rel.slug)}_id`
        break
      }
      case 'self':
        joinPart += ` LEFT JOIN ${safeId(tableName)} AS ${alias} ON ${alias}.id = ${safeId(tableName)}.parent_id`
        break
    }
  }
  return { joinPart, selectFields }
}

// ── CRUD ────────────────────────────────────────────────────────────────
export async function findMany(
  db: DrizzleDb,
  tableName: string,
  entitySlug: string,
  options: QueryOptions
): Promise<{ data: Record<string, unknown>[]; total: number }> {
  await loadRelations(db)

  const tbl = safeId(tableName)
  const includes = options.include || []
  const filter = options.filter || {}
  const sort = options.sort || 'id'
  const page = options.page || 1
  const limit = options.limit || 20
  const offset = (page - 1) * limit
  const includeTrash = options.trash === true

  const orderDir = sort.startsWith('-') ? 'DESC' : 'ASC'
  const sortCol = sort.replace(/^-/, '')
  const { joinPart, selectFields } = buildJoin(tableName, entitySlug, includes)
  const { clause: whereClause, params: whereParams } = buildWhere(filter, tableName, includeTrash)

  // COUNT
  const countSql = `SELECT COUNT(*) as total FROM ${tbl}${joinPart}${whereClause}`
  const countResult = await db.all<{ total: number }>(makeSQL(countSql, whereParams))
  const total = countResult.length > 0 ? Number(countResult[0]?.total ?? 0) : 0

  // DATA
  const dataSql = `SELECT ${selectFields} FROM ${tbl}${joinPart}${whereClause} ORDER BY ${tbl}.${safeId(sortCol)} ${orderDir} LIMIT ? OFFSET ?`
  const dataResult = await db.all<Record<string, unknown>>(makeSQL(dataSql, [...whereParams, limit, offset]))
  let data = dataResult || []

  if (includes.length > 0) {
    data = nestRelations(data, tableName, includes)
  }

  return { data, total }
}

export async function findOne(
  db: DrizzleDb,
  tableName: string,
  entitySlug: string,
  id: number,
  options: QueryOptions
): Promise<Record<string, unknown> | null> {
  const result = await findMany(db, tableName, entitySlug, {
    ...options,
    filter: { ...options.filter, id: String(id) },
    page: 1,
    limit: 1
  })
  return result.data[0] || null
}

export async function createOne(
  db: DrizzleDb,
  tableName: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown> | undefined> {
  const keys = Object.keys(data).filter(k => k !== 'include')
  if (keys.length === 0) {
    return db.get<Record<string, unknown>>(makeSQL(`INSERT INTO ${safeId(tableName)} DEFAULT VALUES RETURNING *`))
  }

  const cols = keys.map(k => safeId(k)).join(', ')
  const placeholders = keys.map(() => '?').join(', ')
  const vals = keys.map(k => {
    const v = data[k]
    if (v === undefined || v === null) return null
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  })

  return db.get<Record<string, unknown>>(
    makeSQL(`INSERT INTO ${safeId(tableName)} (${cols}) VALUES (${placeholders}) RETURNING *`, vals)
  )
}

export async function updateOne(
  db: DrizzleDb,
  tableName: string,
  id: number,
  data: Record<string, unknown>
): Promise<Record<string, unknown> | undefined> {
  const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'include')
  if (keys.length === 0) {
    return db.get<Record<string, unknown>>(makeSQL(`SELECT * FROM ${safeId(tableName)} WHERE id = ?`, [id]))
  }

  const sets = keys.map(k => `${safeId(k)} = ?`)
  const vals = keys.map(k => {
    const v = data[k]
    if (v === undefined || v === null) return null
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  })

  return db.get<Record<string, unknown>>(
    makeSQL(`UPDATE ${safeId(tableName)} SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ? RETURNING *`, [...vals, id])
  )
}

export async function deleteOne(
  db: DrizzleDb,
  tableName: string,
  id: number,
  hardDelete = false
): Promise<boolean> {
  const tbl = safeId(tableName)

  if (hardDelete) {
    await loadRelations(db)
    for (const rel of _rels || []) {
      if (rel.entitySlug && rel.slug) {
        const pivot = rel.pivotTable || `${rel.entitySlug}_${rel.slug}`
        try {
          await db.run(makeSQL(`DELETE FROM ${safeId(pivot)} WHERE ${safeId(rel.entitySlug)}_id = ?`, [id]))
        } catch { /* skip */ }
      }
    }
    for (const rel of _rels || []) {
      if ((rel.relationType === '1:N' || rel.relationType === '1:1') && rel.foreignKey) {
        try {
          await db.run(makeSQL(`UPDATE ${safeId(rel.relatedTable)} SET ${safeId(rel.foreignKey)} = NULL WHERE ${safeId(rel.foreignKey)} = ?`, [id]))
        } catch { /* skip */ }
      }
    }
    await db.run(makeSQL(`DELETE FROM ${tbl} WHERE id = ?`, [id]))
  } else {
    await db.run(makeSQL(`UPDATE ${tbl} SET deleted_at = datetime('now') WHERE id = ?`, [id]))
  }
  return true
}

export async function forceDelete(
  db: DrizzleDb,
  tableName: string,
  id: number
): Promise<boolean> {
  return deleteOne(db, tableName, id, true)
}

export async function restoreOne(
  db: DrizzleDb,
  tableName: string,
  id: number
): Promise<Record<string, unknown> | undefined> {
  const tbl = safeId(tableName)
  await db.run(makeSQL(`UPDATE ${tbl} SET deleted_at = NULL, updated_at = datetime('now') WHERE id = ?`, [id]))
  return db.get<Record<string, unknown>>(makeSQL(`SELECT * FROM ${tbl} WHERE id = ?`, [id]))
}

// ── Relation nesting ────────────────────────────────────────────────────
function nestRelations(
  rows: Record<string, unknown>[],
  tableName: string,
  includes: string[]
): Record<string, unknown>[] {
  const grouped: Record<number, Record<string, unknown>> = {}

  for (const row of rows) {
    const id = row.id as number
    if (!grouped[id]) {
      grouped[id] = { ...row }
      for (const inc of includes) {
        const rel = _relMap.get(inc)
        if (!rel) continue
        for (const key of Object.keys(row)) {
          if (key.startsWith(`_rel_${inc}_`)) {
            delete grouped[id][key]
          }
        }
        grouped[id][inc] = rel.relationType === '1:N' ? [] : null
      }
    }

    for (const inc of includes) {
      const rel = _relMap.get(inc)
      if (!rel) continue
      const relRow: Record<string, unknown> = {}
      let hasData = false
      for (const key of Object.keys(row)) {
        if (key.startsWith(`_rel_${inc}_`)) {
          const actualKey = key.slice(`_rel_${inc}_`.length)
          relRow[actualKey] = row[key]
          if (row[key] !== null) hasData = true
        }
      }
      if (hasData && rel.relationType === '1:N') {
        const arr = grouped[id][inc] as Record<string, unknown>[]
        if (!arr.some((r: Record<string, unknown>) => r.id === relRow.id)) {
          ;(grouped[id][inc] as Record<string, unknown>[]) = [...arr, relRow]
        }
      } else if (hasData) {
        grouped[id][inc] = relRow
      }
    }
  }

  return Object.values(grouped)
}
