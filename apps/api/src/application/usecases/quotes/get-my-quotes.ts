import { Injectable } from '@nestjs/common';
import { QuoteWithBook } from '../../../domain/types/quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';

@Injectable()
export class GetMyQuotesUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}

  async execute(userId: string): Promise<QuoteWithBook[]> {
    return await this.quoteRepository.findWithBookByUserId(userId);
  }
}
