import { Injectable, NotFoundException } from '@nestjs/common';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';

@Injectable()
export class DeleteMemoTemplateUseCase {
  constructor(
    private readonly memoTemplateRepository: IMemoTemplateRepository,
  ) {}

  async execute(id: number, userId: string): Promise<void> {
    const memoTemplate = await this.memoTemplateRepository.findById(id, userId);
    if (!memoTemplate) {
      throw new NotFoundException('テンプレートが見つかりません');
    }
    await this.memoTemplateRepository.delete(id, userId);
  }
}
