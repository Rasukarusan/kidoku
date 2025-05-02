import { Module } from '@nestjs/common';
import { SheetsResolver } from './sheets.resolver';
import { SheetsService } from './sheets.service';
import { SheetsUseCaseModule } from './usecase/usecase.module';

@Module({
  imports: [SheetsUseCaseModule],
  providers: [SheetsResolver, SheetsService],
})
export class SheetsModule {}
