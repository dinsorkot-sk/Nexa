CREATE TABLE `_entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`table_name` text NOT NULL,
	`icon` text,
	`description` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT 'datetime(''now'')',
	`updated_at` text DEFAULT 'datetime(''now'')',
	FOREIGN KEY (`module_id`) REFERENCES `_modules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_entities_slug_unique` ON `_entities` (`slug`);--> statement-breakpoint
CREATE TABLE `_fields` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`field_type` text NOT NULL,
	`is_required` integer DEFAULT false,
	`is_unique` integer DEFAULT false,
	`default_value` text,
	`options` text,
	`validation_rules` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`entity_id`) REFERENCES `_entities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `_generic_references` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_entity` text NOT NULL,
	`source_id` integer NOT NULL,
	`ref_type` text NOT NULL,
	`data` text DEFAULT '{}',
	`created_by` integer,
	`created_at` text DEFAULT 'datetime(''now'')'
);
--> statement-breakpoint
CREATE TABLE `_modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT 'datetime(''now'')',
	`updated_at` text DEFAULT 'datetime(''now'')'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_modules_slug_unique` ON `_modules` (`slug`);--> statement-breakpoint
CREATE TABLE `_relations` (
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
	`created_at` text DEFAULT 'datetime(''now'')',
	FOREIGN KEY (`entity_id`) REFERENCES `_entities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`related_entity_id`) REFERENCES `_entities`(`id`) ON UPDATE no action ON DELETE cascade
);
