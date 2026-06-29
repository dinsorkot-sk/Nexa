import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const genericReferences = sqliteTable('_generic_references', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceEntity: text('source_entity').notNull(),
  sourceId: integer('source_id').notNull(),
  refType: text('ref_type').notNull(),
  data: text('data').default('{}'),
  createdBy: integer('created_by'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})
