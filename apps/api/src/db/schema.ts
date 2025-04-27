import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, varchar, datetime, text, int, unique, json } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const prismaMigrations = mysqlTable("_prisma_migrations", {
	id: varchar({ length: 36 }).notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: datetime("finished_at", { mode: 'string', fsp: 3 }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: datetime("rolled_back_at", { mode: 'string', fsp: 3 }),
	startedAt: datetime("started_at", { mode: 'string', fsp: 3 }).default(sql`(CURRENT_TIMESTAMP(3))`).notNull(),
	appliedStepsCount: int("applied_steps_count", { unsigned: true }).default(0).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "_prisma_migrations_id"}),
]);

export const accounts = mysqlTable("accounts", {
	id: varchar({ length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	type: varchar({ length: 191 }).notNull(),
	provider: varchar({ length: 191 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 191 }).notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: int("expires_at"),
	tokenType: varchar("token_type", { length: 191 }),
	scope: varchar({ length: 191 }),
	idToken: text("id_token"),
	sessionState: varchar("session_state", { length: 191 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "accounts_id"}),
	unique("accounts_provider_provider_account_id_key").on(table.provider, table.providerAccountId),
]);

export const aiSummaries = mysqlTable("ai_summaries", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	sheetId: int("sheet_id").notNull(),
	analysis: json().notNull(),
	token: int().notNull(),
	created: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`),
	updated: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "ai_summaries_id"}),
]);

export const books = mysqlTable("books", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	sheetId: int("sheet_id").notNull(),
	title: varchar({ length: 120 }).notNull(),
	author: varchar({ length: 120 }).notNull(),
	category: varchar({ length: 120 }).notNull(),
	image: varchar({ length: 255 }).notNull(),
	impression: varchar({ length: 5 }).notNull(),
	memo: text().notNull(),
	isPublicMemo: tinyint("is_public_memo").default(0).notNull(),
	isPurchasable: tinyint("is_purchasable").default(0).notNull(),
	finished: datetime({ mode: 'string'}),
	created: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updated: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "books_id"}),
]);

export const sessions = mysqlTable("sessions", {
	id: varchar({ length: 191 }).notNull(),
	sessionToken: varchar("session_token", { length: 191 }).notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sessions_id"}),
	unique("sessions_session_token_key").on(table.sessionToken),
]);

export const sheets = mysqlTable("sheets", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	name: varchar({ length: 120 }).notNull(),
	order: int().default(1),
	created: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`),
	updated: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sheets_id"}),
	unique("uniq_user_id_name").on(table.userId, table.name),
]);

export const templateBooks = mysqlTable("template_books", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	name: varchar({ length: 120 }).notNull(),
	title: varchar({ length: 120 }).notNull(),
	author: varchar({ length: 120 }).notNull(),
	category: varchar({ length: 120 }).notNull(),
	image: varchar({ length: 255 }).notNull(),
	memo: text().notNull(),
	isPublicMemo: tinyint("is_public_memo").default(0).notNull(),
	created: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updated: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "template_books_id"}),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 191 }).notNull(),
	name: varchar({ length: 191 }),
	email: varchar({ length: 191 }),
	emailVerified: datetime("email_verified", { mode: 'string', fsp: 3 }),
	image: varchar({ length: 191 }),
	admin: tinyint().default(0).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("uniq_name").on(table.name),
	unique("users_email_key").on(table.email),
]);

export const verificationtokens = mysqlTable("verificationtokens", {
	identifier: varchar({ length: 191 }).notNull(),
	token: varchar({ length: 191 }).notNull(),
	expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	unique("verificationtokens_identifier_token_key").on(table.identifier, table.token),
	unique("verificationtokens_token_key").on(table.token),
]);

export const yearlyTopBooks = mysqlTable("yearly_top_books", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	userId: varchar("user_id", { length: 191 }).notNull(),
	bookId: int("book_id").notNull(),
	order: int().default(1).notNull(),
	year: varchar({ length: 120 }).notNull(),
	created: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updated: datetime({ mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "yearly_top_books_id"}),
	unique("uniq_user_order_year").on(table.userId, table.order, table.year),
]);
