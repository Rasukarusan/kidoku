import { Injectable, NotFoundException } from '@nestjs/common';
import { Quote } from '../../../domain/models/quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class CreateQuoteUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(params: {
    userId: string;
    bookId: number;
    page: number | null;
    text: string;
    comment: string | null;
  }): Promise<Quote> {
    const book = await this.bookRepository.findById(String(params.bookId));
    if (!book || book.userId !== params.userId) {
      throw new NotFoundException('本が見つかりません');
    }
    const quote = Quote.create(params);
    return await this.quoteRepository.save(quote);
  }
}
