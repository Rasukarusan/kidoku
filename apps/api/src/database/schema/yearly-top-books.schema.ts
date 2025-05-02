import { sql } from 'drizzle-orm';
import {
  mysqlTable,
  primaryKey,
  varchar,
  datetime,
  int,
  unique,
} from 'drizzle-orm/mysql-core';

export const yearlyTopBooks = mysqlTable(
  'yearly_top_books',
  {
    id: int({ unsigned: true }).autoincrement().notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    bookId: int('book_id').notNull(),
    order: int().default(1).notNull(),
    year: varchar({ length: 120 }).notNull(),
    created: datetime({ mode: 'date' })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated: datetime({ mode: 'date' })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'yearly_top_books_id' }),
    unique('uniq_user_order_year').on(table.userId, table.order, table.year),
  ],
);
