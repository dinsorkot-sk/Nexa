import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─── Users ──────────────────────────────────────────────────────────────
export const users = sqliteTable('_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  invitedBy: integer('invited_by'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

// ─── Sessions ───────────────────────────────────────────────────────────
export const sessions = sqliteTable('_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

// ─── Roles ──────────────────────────────────────────────────────────────
export const roles = sqliteTable('_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

// ─── User-Role pivot ────────────────────────────────────────────────────
export const userRoles = sqliteTable('_user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedBy: integer('assigned_by'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

// ─── Invites ────────────────────────────────────────────────────────────
export const invites = sqliteTable('_invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  roleId: integer('role_id').references(() => roles.id, { onDelete: 'set null' }),
  invitedBy: integer('invited_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedAt: text('accepted_at'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

// ─── Password Resets ────────────────────────────────────────────────────
export const passwordResets = sqliteTable('_password_resets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

// ─── Auth Config (singleton row id=1) ──────────────────────────────────
export const authConfig = sqliteTable('_auth_config', {
  id: integer('id').primaryKey().default(1),
  providers: text('providers').notNull().default('{"password":true,"oauth2":false,"saml":false}'),
  session: text('session').notNull().default('{"absoluteTimeout":1440,"idleTimeout":30,"refreshTokenTTL":7}'),
  security: text('security').notNull().default('{"concurrentSessions":true,"mfaEnabled":false}'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' })
})

// ─── Auth Events ────────────────────────────────────────────────────────
export const authEvents = sqliteTable('_auth_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(),
  actor: text('actor'),
  metadata: text('metadata'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})
