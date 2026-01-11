import { Injectable, NotFoundException } from '@nestjs/common';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISearchRepository } from '../../../domain/repositories/search';

@Injectable()
export class DeleteBookUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly searchRepository: ISearchRepository,
  ) {}

  async execute(userId: string, bookId: string): Promise<void> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundException('書籍が見つかりません');
    }

    // 所有者チェック
    if (book.userId !== userId) {
      throw new NotFoundException('書籍が見つかりません');
    }

    await this.bookRepository.delete(bookId, userId);

    // MeiliSearchから削除
    await this.searchRepository.deleteDocument(bookId);
  }
}
