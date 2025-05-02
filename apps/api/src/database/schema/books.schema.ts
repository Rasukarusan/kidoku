import { sql } from 'drizzle-orm';
import {
  mysqlTable,
  primaryKey,
  tinyint,
  varchar,
  datetime,
  text,
  int,
} from 'drizzle-orm/mysql-core';

export const books = mysqlTable(
  'books',
  {
    id: int({ unsigned: true }).autoincrement().notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    sheetId: int('sheet_id').notNull(),
    title: varchar({ length: 120 }).notNull(),
    author: varchar({ length: 120 }).notNull(),
    category: varchar({ length: 120 }).notNull(),
    image: varchar({ length: 255 }).notNull(),
    impression: varchar({ length: 5 }).notNull(),
    memo: text().notNull(),
    isPublicMemo: tinyint('is_public_memo').default(0).notNull(),
    isPurchasable: tinyint('is_purchasable').default(0).notNull(),
    finished: datetime({ mode: 'date' }),
    created: datetime({ mode: 'date' })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated: datetime({ mode: 'date' })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'books_id' })],
);
