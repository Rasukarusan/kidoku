import { Injectable } from '@nestjs/common';
import {
  IBookSearchRepository,
  BookSearchItem,
} from '../../../domain/repositories/book-search';

@Injectable()
export class GetAuthorNewReleasesUseCase {
  constructor(private readonly bookSearchRepository: IBookSearchRepository) {}

  async execute(authorName: string): Promise<BookSearchItem[]> {
    const name = authorName?.trim();
    if (!name) {
      return [];
    }
    return await this.bookSearchRepository.searchByAuthor(name);
  }
}
