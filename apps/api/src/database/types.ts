import { MySqlDatabase } from 'drizzle-orm/mysql-core';
import * as schema from './schema';

export type DrizzleDb = MySqlDatabase<any, any, typeof schema>;
