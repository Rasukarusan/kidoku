import { Injectable } from '@nestjs/common';
import { Quote } from '../../../domain/models/quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';

@Injectable()
export class GetBookQuotesUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}

  async execute(bookId: number, userId: string): Promise<Quote[]> {
    return await this.quoteRepository.findByBookId(bookId, userId);
  }
}
