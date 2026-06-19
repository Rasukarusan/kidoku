import { Injectable } from '@nestjs/common';
import { IPurchaseRepository } from '../../../domain/repositories/purchase';
import { IBookRepository } from '../../../domain/repositories/book';

/**
 * 購入済みユーザー向けにメモ本文を返すユースケース。
 * - 所有者: 常に全文を返す
 * - 公開メモ: マスキング済みの内容を返す
 * - 非公開メモ: 購入済みの場合のみ全文を返す（未購入は null）
 */
@Injectable()
export class GetPurchasedBookMemoUseCase {
  constructor(
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(userId: string, bookId: number): Promise<string | null> {
    const book = await this.bookRepository.findById(String(bookId));
    if (!book) {
      return null;
    }

    const isOwner = book.userId === userId;
    if (isOwner) {
      return book.memo;
    }

    if (book.isPublicMemo) {
      return book.getSanitizedMemo(false);
    }

    const purchase = await this.purchaseRepository.findByUserAndBook(
      userId,
      bookId,
    );
    if (!purchase) {
      return null;
    }

    return book.memo;
  }
}
