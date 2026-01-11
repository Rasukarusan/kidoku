import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '../../../domain/models/book';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISearchRepository } from '../../../domain/repositories/search';

@Injectable()
export class UpdateBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly searchRepository: ISearchRepository,
  ) {}

  async execute(
    userId: string,
    bookId: string,
    params: {
      title?: string;
      author?: string;
      category?: string;
      image?: string;
      impression?: string;
      memo?: string;
      isPublicMemo?: boolean;
      isPurchasable?: boolean;
      finished?: Date | null;
      sheetId?: number;
    },
  ): Promise<Book> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundException('書籍が見つかりません');
    }

    // 所有者チェック
    if (book.userId !== userId) {
      throw new NotFoundException('書籍が見つかりません');
    }

    book.update(params);
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
