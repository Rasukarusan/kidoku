import { Injectable } from '@nestjs/common';
import { AiSummary } from '../../../domain/models/ai-summary';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';
import { ISheetRepository } from '../../../domain/repositories/sheet';

@Injectable()
export class GetAiSummariesUseCase {
  constructor(
    private readonly aiSummaryRepository: IAiSummaryRepository,
    private readonly sheetRepository: ISheetRepository,
  ) {}

  async execute(userId: string, sheetName: string): Promise<AiSummary[]> {
    const sheet = await this.sheetRepository.findByUserIdAndName(
      userId,
      sheetName,
    );
    if (!sheet || !sheet.id) {
      return [];
    }

    return await this.aiSummaryRepository.findByUserIdAndSheetId(
      userId,
      parseInt(sheet.id, 10),
    );
  }
}
