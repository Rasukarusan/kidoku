import { Injectable, NotFoundException } from '@nestjs/common';
import { Quote } from '../../../domain/models/quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';

@Injectable()
export class UpdateQuoteUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}

  async execute(params: {
    id: number;
    userId: string;
    page: number | null;
    text: string;
    comment: string | null;
  }): Promise<Quote> {
    const quote = await this.quoteRepository.findById(params.id, params.userId);
    if (!quote) {
      throw new NotFoundException('引用が見つかりません');
    }
    quote.update({
      page: params.page,
      text: params.text,
      comment: params.comment,
    });
    return await this.quoteRepository.save(quote);
  }
}
