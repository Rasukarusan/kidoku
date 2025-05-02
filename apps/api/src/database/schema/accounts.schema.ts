import {
  mysqlTable,
  primaryKey,
  varchar,
  text,
  int,
  unique,
} from 'drizzle-orm/mysql-core';

export const accounts = mysqlTable(
  'accounts',
  {
    id: varchar({ length: 191 }).notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    type: varchar({ length: 191 }).notNull(),
    provider: varchar({ length: 191 }).notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 191,
    }).notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: int('expires_at'),
    tokenType: varchar('token_type', { length: 191 }),
    scope: varchar({ length: 191 }),
    idToken: text('id_token'),
    sessionState: varchar('session_state', { length: 191 }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'accounts_id' }),
    unique('accounts_provider_provider_account_id_key').on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);
