import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const modules = sqliteTable('_modules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('datetime(\'now\')'),
  updatedAt: text('updated_at').default('datetime(\'now\')')
})

export const entities = sqliteTable('_entities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  moduleId: integer('module_id').references(() => modules.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tableName: text('table_name').notNull(),
  icon: text('icon'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('datetime(\'now\')'),
  updatedAt: text('updated_at').default('datetime(\'now\')')
})

export const fields = sqliteTable('_fields', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityId: integer('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  fieldType: text('field_type').notNull(),
  isRequired: integer('is_required', { mode: 'boolean' }).default(false),
  isUnique: integer('is_unique', { mode: 'boolean' }).default(false),
  defaultValue: text('default_value'),
  options: text('options'),
  validationRules: text('validation_rules'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true)
})
