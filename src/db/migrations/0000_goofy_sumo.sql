CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`premise` text NOT NULL,
	`genre` text NOT NULL,
	`tone` text NOT NULL,
	`aspect_ratio` text NOT NULL,
	`visual_style` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
