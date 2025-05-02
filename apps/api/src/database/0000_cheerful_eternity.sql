-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_prisma_migrations` (
	`id` varchar(36) NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`finished_at` datetime(3),
	`migration_name` varchar(255) NOT NULL,
	`logs` text,
	`rolled_back_at` datetime(3),
	`started_at` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`applied_steps_count` int unsigned NOT NULL DEFAULT 0,
	CONSTRAINT `_prisma_migrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`type` varchar(191) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`provider_account_id` varchar(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(191),
	`scope` varchar(191),
	`id_token` text,
	`session_state` varchar(191),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_provider_provider_account_id_key` UNIQUE(`provider`,`provider_account_id`)
);
--> statement-breakpoint
CREATE TABLE `ai_summaries` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`sheet_id` int NOT NULL,
	`analysis` json NOT NULL,
	`token` int NOT NULL,
	`created` datetime DEFAULT (CURRENT_TIMESTAMP),
	`updated` datetime DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `ai_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`sheet_id` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`author` varchar(120) NOT NULL,
	`category` varchar(120) NOT NULL,
	`image` varchar(255) NOT NULL,
	`impression` varchar(5) NOT NULL,
	`memo` text NOT NULL,
	`is_public_memo` tinyint(1) NOT NULL DEFAULT 0,
	`is_purchasable` tinyint(1) NOT NULL DEFAULT 0,
	`finished` datetime,
	`created` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(191) NOT NULL,
	`session_token` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_session_token_key` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `sheets` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`name` varchar(120) NOT NULL,
	`order` int DEFAULT 1,
	`created` datetime DEFAULT (CURRENT_TIMESTAMP),
	`updated` datetime DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `sheets_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_id_name` UNIQUE(`user_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `template_books` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`name` varchar(120) NOT NULL,
	`title` varchar(120) NOT NULL,
	`author` varchar(120) NOT NULL,
	`category` varchar(120) NOT NULL,
	`image` varchar(255) NOT NULL,
	`memo` text NOT NULL,
	`is_public_memo` tinyint(1) NOT NULL DEFAULT 0,
	`created` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `template_books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191),
	`email` varchar(191),
	`email_verified` datetime(3),
	`image` varchar(191),
	`admin` tinyint(1) NOT NULL DEFAULT 0,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_name` UNIQUE(`name`),
	CONSTRAINT `users_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationtokens` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `verificationtokens_identifier_token_key` UNIQUE(`identifier`,`token`),
	CONSTRAINT `verificationtokens_token_key` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `yearly_top_books` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`book_id` int NOT NULL,
	`order` int NOT NULL DEFAULT 1,
	`year` varchar(120) NOT NULL,
	`created` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `yearly_top_books_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_order_year` UNIQUE(`user_id`,`order`,`year`)
);

*/