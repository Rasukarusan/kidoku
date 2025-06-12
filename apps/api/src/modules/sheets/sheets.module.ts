import { Module } from '@nestjs/common';
import { SheetsResolver } from './sheets.resolver';
import { SheetsService } from './sheets.service';
import { SheetsUseCaseModule } from './usecase/usecase.module';
import { AuthModule } from '../../auth/auth.module';
import { SheetsRepository } from '../../infrastructure/repositories/sheets.repository';

@Module({
  imports: [AuthModule, SheetsUseCaseModule],
  providers: [SheetsResolver, SheetsService, SheetsRepository],
})
export class SheetsModule {}
