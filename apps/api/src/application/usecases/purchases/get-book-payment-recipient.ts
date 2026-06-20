import { Injectable } from '@nestjs/common';
import { IBookRepository } from '../../../domain/repositories/book';
import { IUserRepository } from '../../../domain/repositories/user';

/**
 * 指定した本の支払い先（所有者の Sui 受取アドレス）を返す。
 * 購入対象でない・所有者が未登録の場合は null。
 */
@Injectable()
export class GetBookPaymentRecipientUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(bookId: number): Promise<string | null> {
    const book = await this.bookRepository.findById(String(bookId));
    if (!book || !book.isPurchasable) {
      return null;
    }
    const owner = await this.userRepository.findById(book.userId);
    return owner?.suiAddress ?? null;
  }
}
