import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';
import { INJECTION_TOKENS } from '../constants/injection-tokens';

export const DatabaseProvider = {
  provide: INJECTION_TOKENS.DRIZZLE,
  useFactory: (configService: ConfigService) => {
    const pool = mysql.createPool({
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      user: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASS'),
      database: configService.get<string>('DB_NAME'),
    });

    return drizzle(pool, { schema, mode: 'default' });
  },
  inject: [ConfigService],
};
