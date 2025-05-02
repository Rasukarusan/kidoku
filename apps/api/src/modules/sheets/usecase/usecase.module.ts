import { Module } from '@nestjs/common';
import * as UseCases from './index';
import * as Repositories from '../../../infrastructure/repositories';
import { DatabaseModule } from '../../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [...Object.values(UseCases), ...Object.values(Repositories)],
  exports: Object.values(UseCases),
})
export class SheetsUseCaseModule {}
