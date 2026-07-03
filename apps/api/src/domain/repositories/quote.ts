import { Quote } from '../models/quote';
import { QuoteWithBook } from '../types/quote';

export abstract class IQuoteRepository {
  abstract findByBookId(bookId: number, userId: string): Promise<Quote[]>;
  abstract findWithBookByUserId(userId: string): Promise<QuoteWithBook[]>;
  abstract findById(id: number, userId: string): Promise<Quote | null>;
  abstract save(quote: Quote): Promise<Quote>;
  abstract delete(id: number, userId: string): Promise<void>;
}
