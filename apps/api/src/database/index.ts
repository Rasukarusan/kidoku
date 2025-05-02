import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/mysql2';

console.log({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema, mode: 'default' });

export default db;
