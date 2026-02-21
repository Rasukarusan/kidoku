import { Injectable } from '@nestjs/common';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';

@Injectable()
export class DeleteAiSummaryUseCase {
  constructor(private readonly aiSummaryRepository: IAiSummaryRepository) {}

  async execute(id: number, userId: string): Promise<number> {
    return await this.aiSummaryRepository.delete(id, userId);
  }
}
