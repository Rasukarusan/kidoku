import {
  mysqlTable,
  primaryKey,
  tinyint,
  varchar,
  datetime,
  unique,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
  'users',
  {
    id: varchar({ length: 191 }).notNull(),
    name: varchar({ length: 191 }),
    email: varchar({ length: 191 }),
    emailVerified: datetime('email_verified', { mode: 'string', fsp: 3 }),
    image: varchar({ length: 191 }),
    admin: tinyint().default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'users_id' }),
    unique('uniq_name').on(table.name),
    unique('users_email_key').on(table.email),
  ],
);
