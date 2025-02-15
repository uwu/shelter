CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`settings` text NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);