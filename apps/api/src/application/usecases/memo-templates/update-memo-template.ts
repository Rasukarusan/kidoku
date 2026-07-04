import { Injectable, NotFoundException } from '@nestjs/common';
import { MemoTemplate } from '../../../domain/models/memo-template';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';

@Injectable()
export class UpdateMemoTemplateUseCase {
  constructor(
    private readonly memoTemplateRepository: IMemoTemplateRepository,
  ) {}

  async execute(params: {
    id: number;
    userId: string;
    name: string;
    content: string;
    isDefault: boolean;
  }): Promise<MemoTemplate> {
    const memoTemplate = await this.memoTemplateRepository.findById(
      params.id,
      params.userId,
    );
    if (!memoTemplate) {
      throw new NotFoundException('テンプレートが見つかりません');
    }
    memoTemplate.update({
      name: params.name,
      content: params.content,
      isDefault: params.isDefault,
    });
    return await this.memoTemplateRepository.save(memoTemplate);
  }
}
