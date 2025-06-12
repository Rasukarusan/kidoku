import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './src/database/schema/index.ts',
  out: './src/database',
  dbCredentials: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    database: String(process.env.DB_NAME),
  },
});
