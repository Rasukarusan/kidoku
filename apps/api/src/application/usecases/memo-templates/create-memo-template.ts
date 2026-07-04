import { Injectable } from '@nestjs/common';
import { MemoTemplate } from '../../../domain/models/memo-template';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';

@Injectable()
export class CreateMemoTemplateUseCase {
  constructor(
    private readonly memoTemplateRepository: IMemoTemplateRepository,
  ) {}

  async execute(params: {
    userId: string;
    name: string;
    content: string;
    isDefault: boolean;
  }): Promise<MemoTemplate> {
    const memoTemplate = MemoTemplate.create(params);
    return await this.memoTemplateRepository.save(memoTemplate);
  }
}
