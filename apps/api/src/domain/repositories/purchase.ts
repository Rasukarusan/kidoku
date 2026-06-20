import { Purchase } from '../models/purchase';

export abstract class IPurchaseRepository {
  abstract create(purchase: Purchase): Promise<Purchase>;
  abstract findByUserAndBook(
    userId: string,
    bookId: number,
  ): Promise<Purchase | null>;
  abstract findByTxDigest(txDigest: string): Promise<Purchase | null>;
  abstract findBookIdsByUser(userId: string): Promise<number[]>;
}
