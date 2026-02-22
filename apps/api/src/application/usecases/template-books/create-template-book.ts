import { Injectable } from '@nestjs/common';
import { TemplateBook } from '../../../domain/models/template-book';
import { ITemplateBookRepository } from '../../../domain/repositories/template-book';

@Injectable()
export class CreateTemplateBookUseCase {
  constructor(
    private readonly templateBookRepository: ITemplateBookRepository,
  ) {}

  async execute(params: {
    userId: string;
    name: string;
    title: string;
    author: string;
    category: string;
    image: string;
    memo: string;
    isPublicMemo: boolean;
  }): Promise<TemplateBook> {
    const templateBook = TemplateBook.create(params);
    return await this.templateBookRepository.save(templateBook);
  }
}
