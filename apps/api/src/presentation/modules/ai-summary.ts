import { Module } from '@nestjs/common';
import { AiSummaryResolver } from '../resolvers/ai-summary';
import { AiSummaryController } from '../controllers/ai-summary';
import { GetAiSummariesUseCase } from '../../application/usecases/ai-summaries/get-ai-summaries';
import { GetAiSummaryUsageUseCase } from '../../application/usecases/ai-summaries/get-ai-summary-usage';
import { SaveAiSummaryUseCase } from '../../application/usecases/ai-summaries/save-ai-summary';
import { DeleteAiSummaryUseCase } from '../../application/usecases/ai-summaries/delete-ai-summary';
import { GenerateAiSummaryUseCase } from '../../application/usecases/ai-summaries/generate-ai-summary';
import { AiSummaryRepository } from '../../infrastructure/repositories/ai-summary';
import { SheetRepository } from '../../infrastructure/repositories/sheet';
import { BookRepository } from '../../infrastructure/repositories/book';
import { OpenAiChatGateway } from '../../infrastructure/ai/openai-chat';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IAiSummaryRepository } from '../../domain/repositories/ai-summary';
import { ISheetRepository } from '../../domain/repositories/sheet';
import { IBookRepository } from '../../domain/repositories/book';
import { IAiChatGateway } from '../../domain/gateways/ai-chat';

@Module({
  imports: [AuthModule],
  controllers: [AiSummaryController],
  providers: [
    AiSummaryResolver,
    GetAiSummariesUseCase,
    GetAiSummaryUsageUseCase,
    SaveAiSummaryUseCase,
    DeleteAiSummaryUseCase,
    GenerateAiSummaryUseCase,
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
    {
      provide: IAiChatGateway,
      useClass: OpenAiChatGateway,
    },
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
