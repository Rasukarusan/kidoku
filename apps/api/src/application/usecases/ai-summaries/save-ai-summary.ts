import { Injectable } from '@nestjs/common';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';
import { ISheetRepository } from '../../../domain/repositories/sheet';

@Injectable()
export class SaveAiSummaryUseCase {
  constructor(
    private readonly aiSummaryRepository: IAiSummaryRepository,
    private readonly sheetRepository: ISheetRepository,
  ) {}

  async execute(
    userId: string,
    sheetName: string,
    analysis: Record<string, unknown>,
  ): Promise<void> {
    const requiredKeys = [
      'character_summary',
      'reading_trend_analysis',
      'sentiment_analysis',
      'hidden_theme_discovery',
      'overall_feedback',
    ];
    const hasAllKeys = requiredKeys.every((key) => key in analysis);
    if (!hasAllKeys) {
      throw new Error('Invalid analysis format');
    }

    const sheet = await this.sheetRepository.findByUserIdAndName(
      userId,
      sheetName,
    );
    if (!sheet || !sheet.id) {
      throw new Error('Sheet not found');
    }

    await this.aiSummaryRepository.create(
      userId,
      parseInt(sheet.id, 10),
      {
        _schemaVersion: 2,
        ...analysis,
      },
      0,
    );
  }
}
