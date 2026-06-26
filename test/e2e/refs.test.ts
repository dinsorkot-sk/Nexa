import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

let client: ReturnType<typeof createClient>
let db: ReturnType<typeof drizzle>

beforeAll(async () => {
  client = createClient({ url: ':memory:' })
  db = drizzle(client)
  await db.run(`CREATE TABLE IF NOT EXISTS _generic_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    source_entity TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    ref_type TEXT NOT NULL,
    data TEXT DEFAULT '{}',
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`)
})

afterAll(() => {
  client.close()
})

describe('generic refs CRUD', () => {
  it('creates a ref', async () => {
    const r1 = await db.run(
      `INSERT INTO _generic_references (source_entity, source_id, ref_type) VALUES ('user', 42, 'avatar')`
    )
    const row = (await db.run(`SELECT * FROM _generic_references WHERE id = last_insert_rowid()`)).rows[0]
    expect(row.source_entity).toBe('user')
    expect(row.source_id).toBe(42)
    expect(row.ref_type).toBe('avatar')
  })

  it('filters by source_entity and source_id', async () => {
    const result = await db.run(`SELECT * FROM _generic_references WHERE source_entity = 'user' AND source_id = 42`)
    expect(result.rows.length).toBeGreaterThanOrEqual(1)
    expect(result.rows[0].source_entity).toBe('user')
  })

  it('returns all when no filters', async () => {
    const result = await db.run(`SELECT * FROM _generic_references`)
    expect(result.rows.length).toBeGreaterThanOrEqual(1)
  })

  it('deletes by id', async () => {
    const r1 = await db.run(
      `INSERT INTO _generic_references (source_entity, source_id, ref_type) VALUES ('del', 99, 'temp')`
    )
    const { lastInsertRowid } = r1
    await db.run(`DELETE FROM _generic_references WHERE id = ${lastInsertRowid}`)
    const check = await db.run(`SELECT COUNT(*) as cnt FROM _generic_references WHERE id = ${lastInsertRowid}`)
    expect(check.rows[0].cnt).toBe(0)
  })
})
