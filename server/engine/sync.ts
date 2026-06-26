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
  relatedTable?: string
  entitySlug?: string
}

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

export async function syncEntity(db: { run: (sql: string) => Promise<any> }, entity: EntityDef) {
  await db.run(`
    CREATE TABLE IF NOT EXISTS ${entity.tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)
}

export async function syncField(db: { run: (sql: string) => Promise<any> }, entity: EntityDef, field: FieldDef) {
  const sqlType = typeMap[field.fieldType] || 'TEXT'
  const nullable = field.isRequired ? 'NOT NULL' : ''
  const unique = field.isUnique ? 'UNIQUE' : ''
  await db.run(
    `ALTER TABLE ${entity.tableName} ADD COLUMN ${field.slug} ${sqlType} ${nullable} ${unique}`
  )
}

export async function syncRelation(db: { run: (sql: string) => Promise<any> }, entity: EntityDef, rel: RelationDef) {
  switch (rel.relationType) {
    case '1:1':
      await db.run(
        `ALTER TABLE ${entity.tableName} ADD COLUMN ${rel.foreignKey || rel.slug + '_id'} INTEGER`
      )
      break
    case '1:N':
      await db.run(
        `ALTER TABLE ${rel.relatedTable} ADD COLUMN ${rel.foreignKey || entity.slug + '_id'} INTEGER`
      )
      break
    case 'N:N': {
      const pivot = rel.pivotTable || `${entity.slug}_${rel.slug}`
      await db.run(`
        CREATE TABLE IF NOT EXISTS ${pivot} (
          ${entity.slug}_id INTEGER,
          ${rel.slug}_id INTEGER,
          PRIMARY KEY (${entity.slug}_id, ${rel.slug}_id)
        )
      `)
      break
    }
    case 'self':
      await db.run(`ALTER TABLE ${entity.tableName} ADD COLUMN parent_id INTEGER`)
      break
  }
}

export async function dropEntity(db: { run: (sql: string) => Promise<any> }, entity: EntityDef) {
  await db.run(`DROP TABLE IF EXISTS ${entity.tableName}`)
}
