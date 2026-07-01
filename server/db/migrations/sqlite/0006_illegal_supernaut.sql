CREATE TABLE `_app_config` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`site_name` text DEFAULT 'Nexa' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`logo_url` text,
	`updated_at` text DEFAULT (datetime('now')),
	`updated_by` integer,
	FOREIGN KEY (`updated_by`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `_notification_prefs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`email_enabled` integer DEFAULT true,
	`desktop_enabled` integer DEFAULT false,
	`weekly_digest` integer DEFAULT false,
	`product_updates` integer DEFAULT true,
	`important_updates` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_notification_prefs_user_id_unique` ON `_notification_prefs` (`user_id`);