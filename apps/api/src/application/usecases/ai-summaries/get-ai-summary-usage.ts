import { Injectable } from '@nestjs/common';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';

@Injectable()
export class GetAiSummaryUsageUseCase {
  constructor(private readonly aiSummaryRepository: IAiSummaryRepository) {}

  async execute(userId: string): Promise<number> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return await this.aiSummaryRepository.countByUserIdAndMonth(
      userId,
      start,
      end,
    );
  }
}
