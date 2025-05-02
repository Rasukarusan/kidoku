import { sql } from 'drizzle-orm';
import {
  mysqlTable,
  primaryKey,
  varchar,
  datetime,
  int,
  unique,
} from 'drizzle-orm/mysql-core';

export const sheets = mysqlTable(
  'sheets',
  {
    id: int('id', { unsigned: true }).autoincrement().notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    name: varchar({ length: 120 }).notNull(),
    order: int().default(1),
    created: datetime({ mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`),
    updated: datetime({ mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'sheets_id' }),
    unique('uniq_user_id_name').on(table.userId, table.name),
  ],
);
