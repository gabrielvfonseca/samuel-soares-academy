CREATE TABLE `session` (
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`impersonated_from` text,
	`ip_address` text,
	`token` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `account` (
	`account_id` text NOT NULL,
	`access_token` text,
	`access_token_expires_at` text,
	`created_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`id_token` text,
	`password` text,
	`provider_id` text NOT NULL,
	`refresh_token` text,
	`refresh_token_expires_at` text,
	`scope` text,
	`updated_at` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_user_id` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`created_at` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`name` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`updated_at` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `monthly_fees` (
	`student_id` text,
	`club_id` text,
	`created_at` text NOT NULL,
	`payment_status` text DEFAULT 'Pending' NOT NULL,
	`invoice` text,
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`tax_id` text,
	`notes` text,
	`updated_at` text NOT NULL,
	`amount` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_fees_unique` ON `monthly_fees` (`student_id`,`month`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`automatic` integer DEFAULT false NOT NULL,
	`category` text DEFAULT 'Other' NOT NULL,
	`created_at` text NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`id` text PRIMARY KEY NOT NULL,
	`monthly_fee_id` text,
	`type` text NOT NULL,
	`coach_id` text,
	`training_id` text,
	`updated_at` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`monthly_fee_id`) REFERENCES `monthly_fees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`coach_id`) REFERENCES `coaches`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `coaches` (
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`birth_date` text,
	`email` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`address` text,
	`tax_id` text,
	`name` text NOT NULL,
	`notes` text,
	`whatsapp_phone` text,
	`updated_at` text NOT NULL,
	`group_rate` integer DEFAULT 0 NOT NULL,
	`individual_rate` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_groups` (
	`student_id` text NOT NULL,
	`group_id` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_groups_unique` ON `student_groups` (`student_id`,`group_id`);--> statement-breakpoint
CREATE TABLE `students` (
	`parent_contact` text,
	`created_at` text NOT NULL,
	`enroll_date` text,
	`birth_date` text,
	`parent_email` text,
	`level` text,
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_type` text,
	`name` text NOT NULL,
	`parent_name` text,
	`technical_notes` text,
	`notes` text,
	`athlete_type` text DEFAULT 'Individual' NOT NULL,
	`group_id` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`created_at` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`end_time` text NOT NULL,
	`start_time` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`notes` text,
	`coach_id` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`coach_id`) REFERENCES `coaches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `club_sessions` (
	`club_id` text NOT NULL,
	`created_at` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`end_time` text NOT NULL,
	`start_time` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clubs` (
	`active` integer DEFAULT true NOT NULL,
	`field_id` text,
	`contact` text,
	`created_at` text NOT NULL,
	`day_of_week` integer,
	`email` text,
	`end_time` text,
	`start_time` text,
	`id` text PRIMARY KEY NOT NULL,
	`tax_id` text,
	`name` text NOT NULL,
	`notes` text,
	`coach_id` text,
	`updated_at` text NOT NULL,
	`monthly_fee` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`coach_id`) REFERENCES `coaches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `field_availability` (
	`field_id` text NOT NULL,
	`created_at` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`end_time` text NOT NULL,
	`start_time` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`notes` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fields` (
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`address` text,
	`name` text NOT NULL,
	`notes` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`active` integer DEFAULT true NOT NULL,
	`field_id` text,
	`created_at` text NOT NULL,
	`day_of_week` integer,
	`level` text,
	`end_time` text,
	`start_time` text,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`coach_id` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`coach_id`) REFERENCES `coaches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`preferred_channel` text DEFAULT 'Email' NOT NULL,
	`resend_api_key` text,
	`whatsapp_api_key` text,
	`created_at` text NOT NULL,
	`from_email` text DEFAULT 'onboarding@resend.dev',
	`timezone` text DEFAULT 'Europe/Lisbon' NOT NULL,
	`daily_send_time` text DEFAULT '20:00' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`last_sent_date` text,
	`updated_at` text NOT NULL,
	`whatsapp_phone_id` text
);
--> statement-breakpoint
CREATE TABLE `personal_reminders` (
	`created_at` text NOT NULL,
	`email` text NOT NULL,
	`sent` integer DEFAULT false NOT NULL,
	`sent_at` text,
	`error` text,
	`id` text PRIMARY KEY NOT NULL,
	`when` text NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_history` (
	`channel` text NOT NULL,
	`sent_at` text NOT NULL,
	`detail` text,
	`status` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`coach_id` text,
	`training_id` text,
	FOREIGN KEY (`coach_id`) REFERENCES `coaches`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `trainings` (
	`student_id` text,
	`field` text,
	`club_id` text,
	`created_at` text NOT NULL,
	`end_date` text NOT NULL,
	`start_date` text NOT NULL,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`payment_status` text DEFAULT 'Pending' NOT NULL,
	`invoice` text,
	`id` text PRIMARY KEY NOT NULL,
	`tax_id` text,
	`notes` text,
	`series_id` text,
	`type` text DEFAULT 'Individual' NOT NULL,
	`coach_id` text,
	`group_id` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`coach_id`) REFERENCES `coaches`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE set null
);
