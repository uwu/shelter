CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`settings` text,
	`last_updated` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);