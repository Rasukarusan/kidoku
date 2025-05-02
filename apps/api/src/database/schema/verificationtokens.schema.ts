import { mysqlTable, varchar, datetime, unique } from 'drizzle-orm/mysql-core';

export const verificationtokens = mysqlTable(
  'verificationtokens',
  {
    identifier: varchar({ length: 191 }).notNull(),
    token: varchar({ length: 191 }).notNull(),
    expires: datetime({ mode: 'string', fsp: 3 }).notNull(),
  },
  (table) => [
    unique('verificationtokens_identifier_token_key').on(
      table.identifier,
      table.token,
    ),
    unique('verificationtokens_token_key').on(table.token),
  ],
);
