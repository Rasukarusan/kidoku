import { Injectable } from '@nestjs/common';
import { MemoTemplate } from '../../../domain/models/memo-template';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';

@Injectable()
export class GetMemoTemplatesUseCase {
  constructor(
    private readonly memoTemplateRepository: IMemoTemplateRepository,
  ) {}

  async execute(userId: string): Promise<MemoTemplate[]> {
    return await this.memoTemplateRepository.findByUserId(userId);
  }
}
