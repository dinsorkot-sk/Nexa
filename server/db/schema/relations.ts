import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { entities } from './metadata'

export const relations = sqliteTable('_relations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityId: integer('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  relatedEntityId: integer('related_entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  relationType: text('relation_type').notNull(),
  pivotTable: text('pivot_table'),
  foreignKey: text('foreign_key'),
  isRequired: integer('is_required', { mode: 'boolean' }).default(false),
  onDelete: text('on_delete').default('SET NULL'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})
