import { sql } from 'drizzle-orm';
import {
  mysqlTable,
  primaryKey,
  varchar,
  int,
  json,
  datetime,
} from 'drizzle-orm/mysql-core';

export const aiSummaries = mysqlTable(
  'ai_summaries',
  {
    id: int({ unsigned: true }).autoincrement().notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    sheetId: int('sheet_id').notNull(),
    analysis: json().notNull(),
    token: int().notNull(),
    created: datetime({ mode: 'date' }).default(sql`(CURRENT_TIMESTAMP)`),
    updated: datetime({ mode: 'date' }).default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'ai_summaries_id' })],
);
