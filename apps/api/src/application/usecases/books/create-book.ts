import { Injectable } from '@nestjs/common';
import { Book } from '../../../domain/models/book';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISearchRepository } from '../../../domain/repositories/search';

@Injectable()
export class CreateBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly searchRepository: ISearchRepository,
  ) {}

  async execute(params: {
    userId: string;
    sheetId: number;
    title: string;
    author: string;
    category: string;
    image: string;
    impression: string;
    memo: string;
    isPublicMemo: boolean;
    isPurchasable?: boolean;
    finished: Date | null;
  }): Promise<Book> {
    const book = Book.create(params);
    const savedBook = await this.bookRepository.save(book);

    // MeiliSearchインデックスを更新
    if (savedBook.id) {
      const searchData = await this.bookRepository.findForSearchById(
        savedBook.id,
      );
      if (searchData && searchData.sheetName) {
        await this.searchRepository.updateDocument({
          id: searchData.id,
          title: searchData.title,
          author: searchData.author,
          image: searchData.image,
          memo: searchData.isPublicMemo ? searchData.memo : '',
          username: searchData.userName,
          userImage: searchData.userImage,
          sheet: searchData.sheetName,
        });
      }
    }

    return savedBook;
  }
}
