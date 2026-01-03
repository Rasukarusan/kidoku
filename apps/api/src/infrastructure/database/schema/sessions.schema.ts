import {
  mysqlTable,
  primaryKey,
  varchar,
  datetime,
  unique,
} from 'drizzle-orm/mysql-core';

export const sessions = mysqlTable(
  'sessions',
  {
    id: varchar({ length: 191 }).notNull(),
    sessionToken: varchar('session_token', { length: 191 }).notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'sessions_id' }),
    unique('sessions_session_token_key').on(table.sessionToken),
  ],
);
