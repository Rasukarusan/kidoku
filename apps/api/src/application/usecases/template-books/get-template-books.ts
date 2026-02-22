import { Injectable } from '@nestjs/common';
import { TemplateBook } from '../../../domain/models/template-book';
import { ITemplateBookRepository } from '../../../domain/repositories/template-book';

@Injectable()
export class GetTemplateBooksUseCase {
  constructor(
    private readonly templateBookRepository: ITemplateBookRepository,
  ) {}

  async execute(userId: string): Promise<TemplateBook[]> {
    return await this.templateBookRepository.findByUserId(userId);
  }
}
