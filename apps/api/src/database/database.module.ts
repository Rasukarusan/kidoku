import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseProvider,
  DatabaseConnectionProvider,
} from './database.providers';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseProvider, DatabaseConnectionProvider],
  exports: [DatabaseProvider, DatabaseConnectionProvider],
})
export class DatabaseModule {}
