import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '../../../domain/models/book';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class UpdateBookUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

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
    return await this.bookRepository.save(book);
  }
}
