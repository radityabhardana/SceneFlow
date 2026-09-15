PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_character_relationships` (
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
	FOREIGN KEY (`project_id`,`from_character_id`) REFERENCES `characters`(`project_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`,`to_character_id`) REFERENCES `characters`(`project_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "character_relationships_no_self_check" CHECK("__new_character_relationships"."from_character_id" <> "__new_character_relationships"."to_character_id"),
	CONSTRAINT "character_relationships_strength_check" CHECK("__new_character_relationships"."strength" IS NULL OR ("__new_character_relationships"."strength" >= 0 AND "__new_character_relationships"."strength" <= 100 AND "__new_character_relationships"."strength" = CAST("__new_character_relationships"."strength" AS INTEGER)))
);
--> statement-breakpoint
INSERT INTO `__new_character_relationships`("id", "project_id", "from_character_id", "to_character_id", "type", "description", "strength", "created_at", "updated_at") SELECT "id", "project_id", "from_character_id", "to_character_id", "type", "description", "strength", "created_at", "updated_at" FROM `character_relationships`;--> statement-breakpoint
DROP TABLE `character_relationships`;--> statement-breakpoint
ALTER TABLE `__new_character_relationships` RENAME TO `character_relationships`;--> statement-breakpoint
PRAGMA foreign_keys=ON;