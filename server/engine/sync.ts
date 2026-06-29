export interface EntityDef {
  tableName: string
  slug: string
}

export interface FieldDef {
  slug: string
  fieldType: string
  isRequired?: boolean
  isUnique?: boolean
}

export interface RelationDef {
  slug: string
  relationType: '1:1' | '1:N' | 'N:N' | 'self'
  foreignKey?: string | null
  pivotTable?: string | null
  relatedTable: string
  entitySlug: string
}

interface DrizzleDb {
  run(sql: string, params?: unknown[]): Promise<{ rows?: unknown[], lastInsertRowid?: bigint }>
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | undefined>
  execute(sql: string, params?: unknown[]): Promise<{ rows: unknown[], columns?: string[], lastInsertRowid?: bigint, rowsAffected: number }>
}

// ── Safe identifier validation ──────────────────────────────────────────
const IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/
function safeId(name: string): string {
  if (!IDENTIFIER_RE.test(name)) throw new Error(`Invalid SQL identifier: "${name}"`)
  return name
}

// ── Type mapping ────────────────────────────────────────────────────────
const typeMap: Record<string, string> = {
  text: 'TEXT',
  number: 'REAL',
  boolean: 'INTEGER',
  date: 'TEXT',
  email: 'TEXT',
  url: 'TEXT',
  textarea: 'TEXT',
  select: 'TEXT',
  json: 'TEXT'
}

// ── Transaction helper ──────────────────────────────────────────────────
export async function withTransaction<T>(
  db: DrizzleDb,
  fn: (db: DrizzleDb) => Promise<T>
): Promise<T> {
  await db.run('BEGIN IMMEDIATE')
  try {
    const result = await fn(db)
    await db.run('COMMIT')
    return result
  } catch (err) {
    await db.run('ROLLBACK')
    throw err
  }
}

// ── Ensure column exists (ALTER TABLE ADD COLUMN IF NOT EXISTS pattern) ─
async function ensureColumn(
  db: DrizzleDb,
  tableName: string,
  columnDef: string
): Promise<void> {
  try {
    await db.run(`ALTER TABLE ${safeId(tableName)} ADD COLUMN ${columnDef}`)
  } catch {
    // Column already exists — ignore
  }
}

// ── Sync entity ─────────────────────────────────────────────────────────
export async function syncEntity(
  db: { run: (sql: string, params?: unknown[]) => Promise<unknown> },
  entity: EntityDef
) {
  const tbl = safeId(entity.tableName)
  await db.run(`
    CREATE TABLE IF NOT EXISTS ${tbl} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      created_by INTEGER,
      updated_by INTEGER,
      deleted_at TEXT
    )
  `)
}

/** Add soft-delete / audit columns to an existing table (safe to call repeatedly) */
export async function syncAuditColumns(
  db: DrizzleDb,
  entity: EntityDef
): Promise<void> {
  const tbl = safeId(entity.tableName)
  await ensureColumn(db, tbl, 'created_by INTEGER')
  await ensureColumn(db, tbl, 'updated_by INTEGER')
  await ensureColumn(db, tbl, 'deleted_at TEXT')
}

// ── Sync field ──────────────────────────────────────────────────────────
export async function syncField(
  db: { run: (sql: string, params?: unknown[]) => Promise<unknown> },
  entity: EntityDef,
  field: FieldDef
) {
  const sqlType = typeMap[field.fieldType] || 'TEXT'
  const nullable = field.isRequired ? 'NOT NULL' : ''
  const unique = field.isUnique ? 'UNIQUE' : ''
  const stmt = `ALTER TABLE ${safeId(entity.tableName)} ADD COLUMN ${safeId(field.slug)} ${sqlType} ${nullable} ${unique}`
  try {
    await db.run(stmt)
  } catch {
    // Column may already exist — ignore duplicate column errors
  }
}

// ── Sync relation ───────────────────────────────────────────────────────
export async function syncRelation(
  db: { run: (sql: string, params?: unknown[]) => Promise<unknown> },
  entity: EntityDef,
  rel: RelationDef
) {
  switch (rel.relationType) {
    case '1:1':
      try {
        await db.run(
          `ALTER TABLE ${safeId(entity.tableName)} ADD COLUMN ${safeId(rel.foreignKey || rel.slug + '_id')} INTEGER`
        )
      } catch { /* ignore duplicate */ }
      break
    case '1:N':
      try {
        await db.run(
          `ALTER TABLE ${safeId(rel.relatedTable)} ADD COLUMN ${safeId(rel.foreignKey || entity.slug + '_id')} INTEGER`
        )
      } catch { /* ignore duplicate */ }
      break
    case 'N:N': {
      const pivot = rel.pivotTable || `${entity.slug}_${rel.slug}`
      await db.run(`
        CREATE TABLE IF NOT EXISTS ${safeId(pivot)} (
          ${safeId(entity.slug)}_id INTEGER,
          ${safeId(rel.slug)}_id INTEGER,
          PRIMARY KEY (${safeId(entity.slug)}_id, ${safeId(rel.slug)}_id)
        )
      `)
      break
    }
    case 'self':
      try {
        await db.run(`ALTER TABLE ${safeId(entity.tableName)} ADD COLUMN parent_id INTEGER`)
      } catch { /* ignore duplicate */ }
      break
  }
  // Invalidate relation cache so new/mutated relations are picked up
  const { invalidateRelationCache: invalidate } = await import('./query')
  invalidate()
}

// ── Drop entity ─────────────────────────────────────────────────────────
export async function dropEntity(
  db: { run: (sql: string, params?: unknown[]) => Promise<unknown> },
  entity: EntityDef
) {
  await db.run(`DROP TABLE IF EXISTS ${safeId(entity.tableName)}`)
  // Invalidate relation cache since the entity no longer exists
  const { invalidateRelationCache: invalidate } = await import('./query')
  invalidate()
}

// ── Sync entity with transaction (atomic) ───────────────────────────────
export async function syncEntityAtomic(
  db: DrizzleDb,
  entity: EntityDef,
  fields?: FieldDef[],
  relations?: RelationDef[]
): Promise<void> {
  await withTransaction(db, async (txDb) => {
    await syncEntity(txDb, entity)
    await syncAuditColumns(txDb, entity)
    if (fields) {
      for (const field of fields) {
        await syncField(txDb, entity, field)
      }
    }
    if (relations) {
      for (const rel of relations) {
        await syncRelation(txDb, entity, rel)
      }
    }
  })
  // Reload relation cache so new entity & its relations are immediately available
  const { invalidateRelationCache: invalidate } = await import('./query')
  invalidate()
}
