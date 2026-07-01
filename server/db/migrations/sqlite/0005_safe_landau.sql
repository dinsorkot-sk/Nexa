CREATE TABLE `_auth_config` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`providers` text DEFAULT '{"password":true,"oauth2":false,"saml":false}' NOT NULL,
	`session` text DEFAULT '{"absoluteTimeout":1440,"idleTimeout":30,"refreshTokenTTL":7}' NOT NULL,
	`security` text DEFAULT '{"concurrentSessions":true,"mfaEnabled":false}' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')),
	`updated_by` integer,
	FOREIGN KEY (`updated_by`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `_auth_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_type` text NOT NULL,
	`actor` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `_password_resets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_password_resets_token_unique` ON `_password_resets` (`token`);