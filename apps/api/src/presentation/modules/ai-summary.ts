import { Module } from '@nestjs/common';
import { AiSummaryResolver } from '../resolvers/ai-summary';
import { GetAiSummaryUsageUseCase } from '../../application/usecases/ai-summaries/get-ai-summary-usage';
import { SaveAiSummaryUseCase } from '../../application/usecases/ai-summaries/save-ai-summary';
import { DeleteAiSummaryUseCase } from '../../application/usecases/ai-summaries/delete-ai-summary';
import { AiSummaryRepository } from '../../infrastructure/repositories/ai-summary';
import { SheetRepository } from '../../infrastructure/repositories/sheet';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IAiSummaryRepository } from '../../domain/repositories/ai-summary';
import { ISheetRepository } from '../../domain/repositories/sheet';

@Module({
  imports: [AuthModule],
  providers: [
    AiSummaryResolver,
    GetAiSummaryUsageUseCase,
    SaveAiSummaryUseCase,
    DeleteAiSummaryUseCase,
    {
      provide: IAiSummaryRepository,
      useClass: AiSummaryRepository,
    },
    {
      provide: ISheetRepository,
      useClass: SheetRepository,
    },
  ],
})
export class AiSummaryModule {}
