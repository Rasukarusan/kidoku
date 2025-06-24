import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import {
  INJECTION_TOKENS,
  DATABASE_CONNECTION,
} from '../constants/injection-tokens';

const createDatabaseConnection = (configService: ConfigService) => {
  const dbHost = configService.get<string>('DB_HOST');
  const isProduction = dbHost && dbHost.includes('tidbcloud.com');

  const poolConfig: mysql.PoolOptions = {
    host: dbHost,
    port: configService.get<number>('DB_PORT'),
    user: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASS'),
    database: configService.get<string>('DB_NAME'),
  };

  // 本番環境（TiDBクラウド）の場合のみSSL設定を追加
  if (isProduction) {
    poolConfig.ssl = {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    };
  }

  const pool = mysql.createPool(poolConfig);

  return drizzle(pool, { schema, mode: 'default' });
};

export const DatabaseProvider = {
  provide: INJECTION_TOKENS.DRIZZLE,
  useFactory: createDatabaseConnection,
  inject: [ConfigService],
};

export const DatabaseConnectionProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: createDatabaseConnection,
  inject: [ConfigService],
};
