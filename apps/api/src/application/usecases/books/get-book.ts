import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '../../../domain/models/book';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class GetBookUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(userId: string, bookId: string): Promise<Book> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundException('書籍が見つかりません');
    }

    // 所有者チェック
    if (book.userId !== userId) {
      throw new NotFoundException('書籍が見つかりません');
    }

    return book;
  }
}
