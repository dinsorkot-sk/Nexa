CREATE TABLE `_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`role_id` integer,
	`invited_by` integer,
	`accepted_at` text,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')',
	FOREIGN KEY (`role_id`) REFERENCES `_roles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`invited_by`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_invites_token_unique` ON `_invites` (`token`);--> statement-breakpoint
CREATE TABLE `_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false,
	`created_at` text DEFAULT 'datetime(''now'')'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_roles_slug_unique` ON `_roles` (`slug`);--> statement-breakpoint
CREATE TABLE `_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')',
	FOREIGN KEY (`user_id`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_sessions_token_unique` ON `_sessions` (`token`);--> statement-breakpoint
CREATE TABLE `_user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`assigned_by` integer,
	`created_at` text DEFAULT 'datetime(''now'')',
	FOREIGN KEY (`user_id`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `_roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`avatar_url` text,
	`password_hash` text NOT NULL,
	`is_active` integer DEFAULT true,
	`invited_by` integer,
	`created_at` text DEFAULT 'datetime(''now'')',
	`updated_at` text DEFAULT 'datetime(''now'')'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_users_email_unique` ON `_users` (`email`);