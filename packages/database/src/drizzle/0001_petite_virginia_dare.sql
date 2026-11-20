CREATE TABLE `account` (
	`account_id` text NOT NULL,
	`created_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`scope` text,
	`user_id` text NOT NULL,
	`access_token` text,
	`access_token_expires_at` text,
	`id_token` text,
	`password` text,
	`refresh_token` text,
	`refresh_token_expires_at` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_user_id` ON `account` (`user_id`);