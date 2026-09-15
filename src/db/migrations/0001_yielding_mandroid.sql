CREATE TABLE `character_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`from_character_id` text NOT NULL,
	`to_character_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`strength` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`,`from_character_id`) REFERENCES `characters`(`project_id`,`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`project_id`,`to_character_id`) REFERENCES `characters`(`project_id`,`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "character_relationships_no_self_check" CHECK("character_relationships"."from_character_id" <> "character_relationships"."to_character_id"),
	CONSTRAINT "character_relationships_strength_check" CHECK("character_relationships"."strength" IS NULL OR ("character_relationships"."strength" >= 0 AND "character_relationships"."strength" <= 100 AND "character_relationships"."strength" = CAST("character_relationships"."strength" AS INTEGER)))
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`visual_description` text NOT NULL,
	`personality` text NOT NULL,
	`voice_style` text NOT NULL,
	`locked_traits` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "characters_status_check" CHECK("characters"."status" IN ('active', 'inactive', 'missing', 'removed')),
	CONSTRAINT "characters_personality_json_check" CHECK(json_valid("characters"."personality") AND json_type("characters"."personality") = 'array'),
	CONSTRAINT "characters_locked_traits_json_check" CHECK(json_valid("characters"."locked_traits") AND json_type("characters"."locked_traits") = 'array')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `characters_project_id_id_unique` ON `characters` (`project_id`,`id`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`visual_lock` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `world_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`rule` text NOT NULL,
	`locked` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "world_rules_locked_check" CHECK("world_rules"."locked" IN (0, 1))
);
