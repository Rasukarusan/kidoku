import { Injectable } from '@nestjs/common';
import { IBookRepository } from '../../../domain/repositories/book';
import {
  ISearchRepository,
  BookSearchDocument,
} from '../../../domain/repositories/search';

@Injectable()
export class IndexAllBooksUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly searchRepository: ISearchRepository,
  ) {}

  async execute(): Promise<{ count: number }> {
    const booksForSearch = await this.bookRepository.findAllForSearch();

    const documents: BookSearchDocument[] = booksForSearch.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      memo: book.isPublicMemo ? book.memo : '',
      username: book.userName,
      userImage: book.userImage,
      sheet: book.sheetName,
    }));

    await this.searchRepository.addDocuments(documents);

    return { count: documents.length };
  }
}
