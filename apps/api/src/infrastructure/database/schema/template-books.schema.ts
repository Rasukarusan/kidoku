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

export const templateBooks = mysqlTable(
  'template_books',
  {
    id: int({ unsigned: true }).autoincrement().notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    name: varchar({ length: 120 }).notNull(),
    title: varchar({ length: 120 }).notNull(),
    author: varchar({ length: 120 }).notNull(),
    category: varchar({ length: 120 }).notNull(),
    image: varchar({ length: 255 }).notNull(),
    memo: text().notNull(),
    isPublicMemo: tinyint('is_public_memo').default(0).notNull(),
    created: datetime({ mode: 'string' })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated: datetime({ mode: 'string' })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'template_books_id' })],
);
