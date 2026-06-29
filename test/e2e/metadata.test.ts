import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

let client: ReturnType<typeof createClient>
let db: ReturnType<typeof drizzle>

beforeAll(async () => {
  client = createClient({ url: ':memory:' })
  db = drizzle(client)

  // ── Create metadata tables (mirrors server/db/schema/*) ──────────────
  await db.run(`CREATE TABLE IF NOT EXISTS _modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    description TEXT, icon TEXT,
    is_active INTEGER DEFAULT true,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`)

  await db.run(`CREATE TABLE IF NOT EXISTS _entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    module_id INTEGER,
    name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    table_name TEXT NOT NULL, icon TEXT, description TEXT,
    is_active INTEGER DEFAULT true,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (module_id) REFERENCES _modules(id) ON DELETE SET NULL
  )`)

  await db.run(`CREATE TABLE IF NOT EXISTS _fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    entity_id INTEGER NOT NULL,
    name TEXT NOT NULL, slug TEXT NOT NULL,
    field_type TEXT NOT NULL,
    is_required INTEGER DEFAULT false,
    is_unique INTEGER DEFAULT false,
    default_value TEXT, options TEXT,
    validation_rules TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT true,
    FOREIGN KEY (entity_id) REFERENCES _entities(id) ON DELETE CASCADE
  )`)

  await db.run(`CREATE TABLE IF NOT EXISTS _relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    entity_id INTEGER NOT NULL,
    related_entity_id INTEGER NOT NULL,
    name TEXT NOT NULL, slug TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    pivot_table TEXT, foreign_key TEXT,
    is_required INTEGER DEFAULT false,
    on_delete TEXT DEFAULT 'SET NULL',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (entity_id) REFERENCES _entities(id) ON DELETE CASCADE,
    FOREIGN KEY (related_entity_id) REFERENCES _entities(id) ON DELETE CASCADE
  )`)
})

afterAll(() => {
  client.close()
})

describe('entity CRUD', () => {
  let entityId: number

  it('creates an entity', async () => {
    const result = await db.run(
      `INSERT INTO _entities (name, slug, table_name)
       VALUES ('Pages', 'pages', '_cms_pages')`
    )
    entityId = Number(result.lastInsertRowid)
    expect(entityId).toBeGreaterThan(0)

    const row = (await db.run(`SELECT * FROM _entities WHERE id = ${entityId}`)).rows[0]
    expect(row.name).toBe('Pages')
    expect(row.slug).toBe('pages')
    expect(row.table_name).toBe('_cms_pages')
    expect(row.is_active).toBe(1)
  })

  it('lists all entities', async () => {
    // Insert a second entity
    await db.run(
      `INSERT INTO _entities (name, slug, table_name)
       VALUES ('Blocks', 'blocks', '_cms_blocks')`
    )

    const result = await db.run('SELECT id, name, slug, table_name FROM _entities ORDER BY id')
    expect(result.rows.length).toBeGreaterThanOrEqual(2)
    expect(result.rows.map(r => r.name)).toContain('Pages')
    expect(result.rows.map(r => r.name)).toContain('Blocks')
  })

  it('filters entities by name', async () => {
    const result = await db.run(
      `SELECT * FROM _entities WHERE name = 'Pages'`
    )
    expect(result.rows.length).toBe(1)
    expect(result.rows[0].name).toBe('Pages')
  })

  it('enforces unique slug', async () => {
    await expect(
      db.run(
        `INSERT INTO _entities (name, slug, table_name)
         VALUES ('Pages Dupe', 'pages', '_pages_dupe')`
      )
    ).rejects.toThrow()
  })

  it('updates an entity', async () => {
    await db.run(
      `UPDATE _entities SET description = 'Static and dynamic pages' WHERE id = ${entityId}`
    )
    const row = (await db.run(`SELECT * FROM _entities WHERE id = ${entityId}`)).rows[0]
    expect(row.description).toBe('Static and dynamic pages')
  })

  it('deletes an entity without cascade (no fields)', async () => {
    const r = await db.run(
      `INSERT INTO _entities (name, slug, table_name)
       VALUES ('Temp', 'temp', '_temp')`
    )
    const tempId = Number(r.lastInsertRowid)

    await db.run(`DELETE FROM _entities WHERE id = ${tempId}`)
    const check = await db.run(`SELECT COUNT(*) as cnt FROM _entities WHERE id = ${tempId}`)
    expect(check.rows[0].cnt).toBe(0)
  })
})

describe('field CRUD', () => {
  let entityId: number
  let fieldId: number

  beforeAll(async () => {
    // Ensure a clean entity for field tests
    const r = await db.run(
      `INSERT INTO _entities (name, slug, table_name)
       VALUES ('Posts', 'posts', '_blog_posts')`
    )
    entityId = Number(r.lastInsertRowid)
  })

  it('creates a field', async () => {
    const result = await db.run(
      `INSERT INTO _fields (entity_id, name, slug, field_type, is_required, sort_order)
       VALUES (${entityId}, 'Title', 'title', 'text', true, 0)`
    )
    fieldId = Number(result.lastInsertRowid)
    expect(fieldId).toBeGreaterThan(0)

    const row = (await db.run(`SELECT * FROM _fields WHERE id = ${fieldId}`)).rows[0]
    expect(row.name).toBe('Title')
    expect(row.slug).toBe('title')
    expect(row.field_type).toBe('text')
    expect(row.is_required).toBe(1)
  })

  it('lists fields for an entity', async () => {
    // Add more fields
    await db.run(
      `INSERT INTO _fields (entity_id, name, slug, field_type, sort_order)
       VALUES (${entityId}, 'Slug', 'slug', 'text', 1)`
    )
    await db.run(
      `INSERT INTO _fields (entity_id, name, slug, field_type, is_unique, sort_order)
       VALUES (${entityId}, 'Views', 'views', 'number', true, 2)`
    )

    const result = await db.run(
      `SELECT id, name, slug, field_type, is_unique, sort_order
       FROM _fields WHERE entity_id = ${entityId}
       ORDER BY sort_order`
    )
    expect(result.rows.length).toBe(3)
    expect(result.rows[0].name).toBe('Title')
    expect(result.rows[1].name).toBe('Slug')
    expect(result.rows[2].name).toBe('Views')
    expect(Number(result.rows[2].is_unique)).toBe(1)
  })

  it('updates a field', async () => {
    await db.run(
      `UPDATE _fields SET is_required = false, default_value = 'Untitled'
       WHERE id = ${fieldId}`
    )
    const row = (await db.run(`SELECT * FROM _fields WHERE id = ${fieldId}`)).rows[0]
    expect(row.is_required).toBe(0)
    expect(row.default_value).toBe('Untitled')
  })

  it('deletes a field', async () => {
    const r = await db.run(
      `INSERT INTO _fields (entity_id, name, slug, field_type)
       VALUES (${entityId}, 'Temp', 'temp', 'text')`
    )
    const tempFieldId = Number(r.lastInsertRowid)

    await db.run(`DELETE FROM _fields WHERE id = ${tempFieldId}`)
    const check = await db.run(`SELECT COUNT(*) as cnt FROM _fields WHERE id = ${tempFieldId}`)
    expect(check.rows[0].cnt).toBe(0)
  })

  it('cascades delete when entity is removed', async () => {
    // Count fields before deletion
    const before = (await db.run(
      `SELECT COUNT(*) as cnt FROM _fields WHERE entity_id = ${entityId}`
    )).rows[0].cnt
    expect(Number(before)).toBeGreaterThan(0)

    // Delete the entity → should cascade delete all its fields
    await db.run(`DELETE FROM _entities WHERE id = ${entityId}`)

    const after = (await db.run(
      `SELECT COUNT(*) as cnt FROM _fields WHERE entity_id = ${entityId}`
    )).rows[0].cnt
    expect(Number(after)).toBe(0)
  })
})

describe('relation CRUD', () => {
  let entityAId: number
  let entityBId: number
  let relationId: number

  beforeAll(async () => {
    // Create two entities for relation tests
    const r1 = await db.run(
      `INSERT INTO _entities (name, slug, table_name)
       VALUES ('Authors', 'authors', '_authors')`
    )
    entityAId = Number(r1.lastInsertRowid)

    const r2 = await db.run(
      `INSERT INTO _entities (name, slug, table_name)
       VALUES ('Books', 'books', '_books')`
    )
    entityBId = Number(r2.lastInsertRowid)
  })

  it('creates a relation', async () => {
    const result = await db.run(
      `INSERT INTO _relations (entity_id, related_entity_id, name, slug, relation_type, foreign_key)
       VALUES (${entityAId}, ${entityBId}, 'authors_books', 'authors_books', '1:N', 'author_id')`
    )
    relationId = Number(result.lastInsertRowid)
    expect(relationId).toBeGreaterThan(0)

    const row = (await db.run(`SELECT * FROM _relations WHERE id = ${relationId}`)).rows[0]
    expect(row.entity_id).toBe(entityAId)
    expect(row.related_entity_id).toBe(entityBId)
    expect(row.relation_type).toBe('1:N')
    expect(row.foreign_key).toBe('author_id')
  })

  it('lists relations', async () => {
    const result = await db.run('SELECT * FROM _relations ORDER BY id')
    expect(result.rows.length).toBeGreaterThanOrEqual(1)
    expect(result.rows.some(r => r.name === 'authors_books')).toBe(true)
  })

  it('supports different relation types', async () => {
    // 1:1 relation
    const r1 = await db.run(
      `INSERT INTO _relations (entity_id, related_entity_id, name, slug, relation_type, foreign_key)
       VALUES (${entityAId}, ${entityBId}, 'profile', 'profile', '1:1', 'profile_id')`
    )
    expect(r1.lastInsertRowid).toBeGreaterThan(0)

    // N:N relation with pivot
    const r2 = await db.run(
      `INSERT INTO _relations (entity_id, related_entity_id, name, slug, relation_type, pivot_table)
       VALUES (${entityAId}, ${entityBId}, 'books_authors', 'books_authors', 'N:N', '_authors_books')`
    )
    expect(r2.lastInsertRowid).toBeGreaterThan(0)

    // Self-reference
    const r3 = await db.run(
      `INSERT INTO _relations (entity_id, related_entity_id, name, slug, relation_type)
       VALUES (${entityAId}, ${entityAId}, 'parent', 'parent', 'self')`
    )
    expect(r3.lastInsertRowid).toBeGreaterThan(0)

    const result = await db.run('SELECT relation_type, foreign_key, pivot_table FROM _relations ORDER BY id DESC LIMIT 3')
    const types = result.rows.map(r => r.relation_type)
    expect(types).toContain('1:1')
    expect(types).toContain('N:N')
    expect(types).toContain('self')
  })

  it('updates a relation', async () => {
    await db.run(
      `UPDATE _relations SET foreign_key = 'author_id_new', is_required = true
       WHERE id = ${relationId}`
    )
    const row = (await db.run(`SELECT * FROM _relations WHERE id = ${relationId}`)).rows[0]
    expect(row.foreign_key).toBe('author_id_new')
    expect(row.is_required).toBe(1)
  })

  it('deletes a relation', async () => {
    await db.run(`DELETE FROM _relations WHERE id = ${relationId}`)
    const check = await db.run(`SELECT COUNT(*) as cnt FROM _relations WHERE id = ${relationId}`)
    expect(check.rows[0].cnt).toBe(0)
  })

  it('cascades delete when source entity is removed', async () => {
    // Create a temp relation
    const r = await db.run(
      `INSERT INTO _relations (entity_id, related_entity_id, name, slug, relation_type)
       VALUES (${entityAId}, ${entityBId}, 'temp_rel', 'temp_rel', '1:1')`
    )
    const relId = Number(r.lastInsertRowid)

    // Verify it exists before delete
    const exists = await db.run(
      `SELECT COUNT(*) as cnt FROM _relations WHERE id = ${relId}`
    )
    expect(Number(exists.rows[0].cnt)).toBe(1)

    // Delete the source entity → cascade should remove the relation
    await db.run(`DELETE FROM _entities WHERE id = ${entityAId}`)

    // Relation should be cascade-deleted
    const after = (await db.run(
      `SELECT COUNT(*) as cnt FROM _relations WHERE id = ${relId}`
    )).rows[0].cnt
    expect(Number(after)).toBe(0)

    // entityB should still exist (not cascade-deleted)
    const entityBExists = await db.run(
      `SELECT COUNT(*) as cnt FROM _entities WHERE id = ${entityBId}`
    )
    expect(Number(entityBExists.rows[0].cnt)).toBe(1)
  })
})
