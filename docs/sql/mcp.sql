-- Additive MCP schema for installations managed with prisma db push.
-- No foreign keys: this project uses Prisma relationMode = "prisma".
CREATE TABLE `mcp_clients` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `redirect_uris` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mcp_grants` (
  `id` VARCHAR(191) NOT NULL,
  `client_id` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(120) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `code_hash` VARCHAR(64) NULL,
  `code_challenge_hash` VARCHAR(64) NOT NULL,
  `redirect_uri_hash` VARCHAR(64) NOT NULL,
  `resource` VARCHAR(255) NOT NULL,
  `code_expires_at` DATETIME(3) NOT NULL,
  `token_hash` VARCHAR(64) NULL,
  `token_expires_at` DATETIME(3) NULL,
  `refresh_hash` VARCHAR(64) NULL,
  `expires_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `mcp_grants_code_hash_key` (`code_hash`),
  UNIQUE INDEX `mcp_grants_token_hash_key` (`token_hash`),
  UNIQUE INDEX `mcp_grants_refresh_hash_key` (`refresh_hash`),
  INDEX `mcp_grants_client_id_idx` (`client_id`),
  INDEX `mcp_grants_user_id_idx` (`user_id`),
  INDEX `mcp_grants_expires_at_idx` (`expires_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
