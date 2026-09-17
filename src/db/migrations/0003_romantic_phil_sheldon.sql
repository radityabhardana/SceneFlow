CREATE TABLE `character_states` (
	`project_id` text NOT NULL,
	`character_id` text NOT NULL,
	`location_id` text,
	`emotion` text,
	`condition` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `character_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`,`character_id`) REFERENCES `characters`(`project_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`,`location_id`) REFERENCES `locations`(`project_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `object_states` (
	`project_id` text NOT NULL,
	`object_id` text NOT NULL,
	`holder_character_id` text,
	`location_id` text,
	`condition` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `object_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`,`object_id`) REFERENCES `story_objects`(`project_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`,`holder_character_id`) REFERENCES `characters`(`project_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`,`location_id`) REFERENCES `locations`(`project_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "object_states_single_holder_or_location_check" CHECK("object_states"."holder_character_id" IS NULL OR "object_states"."location_id" IS NULL)
);
--> statement-breakpoint
CREATE TABLE `story_objects` (
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
CREATE UNIQUE INDEX `story_objects_project_id_id_unique` ON `story_objects` (`project_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `locations_project_id_id_unique` ON `locations` (`project_id`,`id`);