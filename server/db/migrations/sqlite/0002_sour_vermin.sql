PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new__invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`role_id` integer,
	`invited_by` integer,
	`accepted_at` text,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`role_id`) REFERENCES `_roles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`invited_by`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new__invites`("id", "email", "token", "role_id", "invited_by", "accepted_at", "expires_at", "created_at") SELECT "id", "email", "token", "role_id", "invited_by", "accepted_at", "expires_at", "created_at" FROM `_invites`;--> statement-breakpoint
DROP TABLE `_invites`;--> statement-breakpoint
ALTER TABLE `__new__invites` RENAME TO `_invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `_invites_token_unique` ON `_invites` (`token`);--> statement-breakpoint
CREATE TABLE `__new__roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new__roles`("id", "name", "slug", "description", "is_system", "created_at") SELECT "id", "name", "slug", "description", "is_system", "created_at" FROM `_roles`;--> statement-breakpoint
DROP TABLE `_roles`;--> statement-breakpoint
ALTER TABLE `__new__roles` RENAME TO `_roles`;--> statement-breakpoint
CREATE UNIQUE INDEX `_roles_slug_unique` ON `_roles` (`slug`);--> statement-breakpoint
CREATE TABLE `__new__sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new__sessions`("id", "user_id", "token", "expires_at", "created_at") SELECT "id", "user_id", "token", "expires_at", "created_at" FROM `_sessions`;--> statement-breakpoint
DROP TABLE `_sessions`;--> statement-breakpoint
ALTER TABLE `__new__sessions` RENAME TO `_sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `_sessions_token_unique` ON `_sessions` (`token`);--> statement-breakpoint
CREATE TABLE `__new__user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`assigned_by` integer,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `_roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new__user_roles`("id", "user_id", "role_id", "assigned_by", "created_at") SELECT "id", "user_id", "role_id", "assigned_by", "created_at" FROM `_user_roles`;--> statement-breakpoint
DROP TABLE `_user_roles`;--> statement-breakpoint
ALTER TABLE `__new__user_roles` RENAME TO `_user_roles`;--> statement-breakpoint
CREATE TABLE `__new__users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`avatar_url` text,
	`password_hash` text NOT NULL,
	`is_active` integer DEFAULT true,
	`invited_by` integer,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new__users`("id", "name", "email", "avatar_url", "password_hash", "is_active", "invited_by", "created_at", "updated_at") SELECT "id", "name", "email", "avatar_url", "password_hash", "is_active", "invited_by", "created_at", "updated_at" FROM `_users`;--> statement-breakpoint
DROP TABLE `_users`;--> statement-breakpoint
ALTER TABLE `__new__users` RENAME TO `_users`;--> statement-breakpoint
CREATE UNIQUE INDEX `_users_email_unique` ON `_users` (`email`);