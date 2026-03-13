import { Injectable } from '@nestjs/common';
import {
  IBookSearchRepository,
  BookSearchItem,
} from '../../../domain/repositories/book-search';

@Injectable()
export class SearchExternalBooksUseCase {
  constructor(private readonly bookSearchRepository: IBookSearchRepository) {}

  async execute(query: string): Promise<BookSearchItem[]> {
    return await this.bookSearchRepository.searchByTitle(query);
  }
}
