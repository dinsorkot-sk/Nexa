import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { syncEntity, syncField, dropEntity } from '../../server/engine/sync'
import { createOne, findMany, findOne, updateOne, deleteOne, forceDelete, restoreOne } from '../../server/engine/query'

interface ArticleRow {
  id: number
  title: string
  views: number
  deleted_at: string | null
}

let client: ReturnType<typeof createClient>
let db: ReturnType<typeof drizzle>

const TABLE = '_test_articles'
const ENTITY_SLUG = 'articles'

beforeAll(async () => {
  client = createClient({ url: ':memory:' })
  db = drizzle(client)
  await db.run(`CREATE TABLE IF NOT EXISTS _modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT, icon TEXT,
    is_active INTEGER DEFAULT true,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`)
  await db.run('CREATE UNIQUE INDEX IF NOT EXISTS _modules_slug_unique ON _modules (slug)')
  await db.run(`CREATE TABLE IF NOT EXISTS _entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    module_id INTEGER, name TEXT NOT NULL, slug TEXT NOT NULL,
    table_name TEXT NOT NULL, icon TEXT, description TEXT,
    is_active INTEGER DEFAULT true,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (module_id) REFERENCES _modules(id) ON DELETE SET NULL
  )`)
  await db.run('CREATE UNIQUE INDEX IF NOT EXISTS _entities_slug_unique ON _entities (slug)')
  await db.run(`CREATE TABLE IF NOT EXISTS _fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    entity_id INTEGER NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL,
    field_type TEXT NOT NULL, is_required INTEGER DEFAULT false,
    is_unique INTEGER DEFAULT false, default_value TEXT, options TEXT,
    validation_rules TEXT, sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT true,
    FOREIGN KEY (entity_id) REFERENCES _entities(id) ON DELETE CASCADE
  )`)
  await db.run(`CREATE TABLE IF NOT EXISTS _relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    entity_id INTEGER NOT NULL, related_entity_id INTEGER NOT NULL,
    name TEXT NOT NULL, slug TEXT NOT NULL, relation_type TEXT NOT NULL,
    pivot_table TEXT, foreign_key TEXT, is_required INTEGER DEFAULT false,
    on_delete TEXT DEFAULT 'SET NULL',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (entity_id) REFERENCES _entities(id) ON DELETE CASCADE,
    FOREIGN KEY (related_entity_id) REFERENCES _entities(id) ON DELETE CASCADE
  )`)
  await dropEntity(db as never, { tableName: TABLE, slug: ENTITY_SLUG })
  await syncEntity(db as never, { tableName: TABLE, slug: ENTITY_SLUG })
  await syncField(
    db as never,
    { tableName: TABLE, slug: ENTITY_SLUG },
    { slug: 'title', fieldType: 'text' }
  )
  await syncField(
    db as never,
    { tableName: TABLE, slug: ENTITY_SLUG },
    { slug: 'views', fieldType: 'number' }
  )
})

afterAll(() => {
  client.close()
})

describe('engine CRUD', () => {
  let createdId: number

  it('createOne inserts and returns the row', async () => {
    const row = await createOne(db as never, TABLE, { title: 'Hello', views: 10 }) as ArticleRow | undefined
    expect(row!.title).toBe('Hello')
    expect(row!.views).toBe(10)
    expect(row!.id).toBeGreaterThan(0)
    createdId = row!.id
  })

  it('findMany returns with filter', async () => {
    const { data, total } = await findMany(db as never, TABLE, ENTITY_SLUG, {
      filter: { title: 'Hello' }
    })
    expect(total).toBe(1)
    expect((data[0] as unknown as ArticleRow).title).toBe('Hello')
  })

  it('findMany returns with pagination', async () => {
    const { data, total } = await findMany(db as never, TABLE, ENTITY_SLUG, {
      page: 1,
      limit: 10
    })
    expect(total).toBeGreaterThanOrEqual(1)
    expect(data.length).toBeGreaterThanOrEqual(1)
  })

  it('findOne returns a single row', async () => {
    const row = await findOne(db as never, TABLE, ENTITY_SLUG, createdId, {}) as ArticleRow | null
    expect(row).not.toBeNull()
    expect(row!.title).toBe('Hello')
  })

  it('updateOne modifies and returns the updated row', async () => {
    const updated = await updateOne(db as never, TABLE, createdId, { title: 'World' }) as ArticleRow | undefined
    expect(updated!.title).toBe('World')
    const row = await findOne(db as never, TABLE, ENTITY_SLUG, createdId, {}) as ArticleRow | null
    expect(row!.title).toBe('World')
  })

  it('deleteOne soft-deletes the row', async () => {
    const ok = await deleteOne(db as never, TABLE, createdId)
    expect(ok).toBe(true)
    // findOne excludes soft-deleted by default
    const row = await findOne(db as never, TABLE, ENTITY_SLUG, createdId, {})
    expect(row).toBeNull()
  })

  it('soft-deleted rows are excluded from findMany by default', async () => {
    const { data, total } = await findMany(db as never, TABLE, ENTITY_SLUG, {
      filter: { title: 'World' }
    })
    expect(total).toBe(0)
    expect(data.length).toBe(0)
  })

  it('trash:true includes soft-deleted rows', async () => {
    const { data, total } = await findMany(db as never, TABLE, ENTITY_SLUG, {
      filter: { title: 'World' },
      trash: true
    })
    expect(total).toBeGreaterThanOrEqual(1)
    expect(data.length).toBeGreaterThanOrEqual(1)
    expect((data[0] as unknown as ArticleRow).title).toBe('World')
  })

  it('restoreOne brings back a soft-deleted row', async () => {
    const restored = await restoreOne(db as never, TABLE, createdId) as ArticleRow | undefined
    expect(restored).not.toBeNull()
    expect(restored!.title).toBe('World')
    expect(restored!.deleted_at).toBeNull()

    // Now visible in normal queries
    const row = await findOne(db as never, TABLE, ENTITY_SLUG, createdId, {}) as ArticleRow | null
    expect(row).not.toBeNull()
  })

  it('forceDelete permanently removes the row', async () => {
    // Create a record to hard-delete
    const toDelete = await createOne(db as never, TABLE, { title: 'Temporary', views: 0 }) as ArticleRow | undefined
    const delId = toDelete!.id

    const ok = await forceDelete(db as never, TABLE, delId)
    expect(ok).toBe(true)

    // Not found even with trash:true (hard deleted)
    const row = await findOne(db as never, TABLE, ENTITY_SLUG, delId, { trash: true })
    expect(row).toBeNull()
  })

  it('findMany with sorting', async () => {
    // Use views > 10 so the pre-existing row from restore-test (views=10) doesn't pollute the top-2
    await createOne(db as never, TABLE, { title: 'A', views: 10 })
    await createOne(db as never, TABLE, { title: 'B', views: 20 })
    await createOne(db as never, TABLE, { title: 'C', views: 30 })
    const { data } = await findMany(db as never, TABLE, ENTITY_SLUG, {
      sort: '-views',
      limit: 2
    })
    expect((data[0] as unknown as ArticleRow).title).toBe('C')
    expect((data[1] as unknown as ArticleRow).title).toBe('B')
  })

  it('createOne with empty data uses DEFAULT VALUES', async () => {
    const row = await createOne(db as never, TABLE, {}) as Record<string, unknown> | undefined
    expect(row).not.toBeNull()
    expect(row!.id).toBeGreaterThan(0)
  })

  it('safeId rejects invalid identifiers', async () => {
    const { safeId } = await import('../../server/engine/query')
    expect(() => safeId('DROP TABLE users')).toThrow('Invalid SQL identifier')
    expect(() => safeId("'; DELETE FROM users; --")).toThrow('Invalid SQL identifier')
    expect(() => safeId('normal_name_123')).not.toThrow()
  })
})
