import { Injectable } from '@nestjs/common';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class GetBookCategoriesUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(userId: string): Promise<string[]> {
    return await this.bookRepository.getCategories(userId);
  }
}
