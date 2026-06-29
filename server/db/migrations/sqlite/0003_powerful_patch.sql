PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new__entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`table_name` text NOT NULL,
	`icon` text,
	`description` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`module_id`) REFERENCES `_modules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new__entities`("id", "module_id", "name", "slug", "table_name", "icon", "description", "is_active", "created_at", "updated_at") SELECT "id", "module_id", "name", "slug", "table_name", "icon", "description", "is_active", "created_at", "updated_at" FROM `_entities`;--> statement-breakpoint
DROP TABLE `_entities`;--> statement-breakpoint
ALTER TABLE `__new__entities` RENAME TO `_entities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `_entities_slug_unique` ON `_entities` (`slug`);--> statement-breakpoint
CREATE TABLE `__new__generic_references` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_entity` text NOT NULL,
	`source_id` integer NOT NULL,
	`ref_type` text NOT NULL,
	`data` text DEFAULT '{}',
	`created_by` integer,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new__generic_references`("id", "source_entity", "source_id", "ref_type", "data", "created_by", "created_at") SELECT "id", "source_entity", "source_id", "ref_type", "data", "created_by", "created_at" FROM `_generic_references`;--> statement-breakpoint
DROP TABLE `_generic_references`;--> statement-breakpoint
ALTER TABLE `__new__generic_references` RENAME TO `_generic_references`;--> statement-breakpoint
CREATE TABLE `__new__modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new__modules`("id", "name", "slug", "description", "icon", "is_active", "created_at", "updated_at") SELECT "id", "name", "slug", "description", "icon", "is_active", "created_at", "updated_at" FROM `_modules`;--> statement-breakpoint
DROP TABLE `_modules`;--> statement-breakpoint
ALTER TABLE `__new__modules` RENAME TO `_modules`;--> statement-breakpoint
CREATE UNIQUE INDEX `_modules_slug_unique` ON `_modules` (`slug`);--> statement-breakpoint
CREATE TABLE `__new__relations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_id` integer NOT NULL,
	`related_entity_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`relation_type` text NOT NULL,
	`pivot_table` text,
	`foreign_key` text,
	`is_required` integer DEFAULT false,
	`on_delete` text DEFAULT 'SET NULL',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`entity_id`) REFERENCES `_entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`related_entity_id`) REFERENCES `_entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new__relations`("id", "entity_id", "related_entity_id", "name", "slug", "relation_type", "pivot_table", "foreign_key", "is_required", "on_delete", "created_at") SELECT "id", "entity_id", "related_entity_id", "name", "slug", "relation_type", "pivot_table", "foreign_key", "is_required", "on_delete", "created_at" FROM `_relations`;--> statement-breakpoint
DROP TABLE `_relations`;--> statement-breakpoint
ALTER TABLE `__new__relations` RENAME TO `_relations`;