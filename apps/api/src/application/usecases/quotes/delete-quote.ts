import { Injectable, NotFoundException } from '@nestjs/common';
import { IQuoteRepository } from '../../../domain/repositories/quote';

@Injectable()
export class DeleteQuoteUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}

  async execute(id: number, userId: string): Promise<void> {
    const quote = await this.quoteRepository.findById(id, userId);
    if (!quote) {
      throw new NotFoundException('引用が見つかりません');
    }
    await this.quoteRepository.delete(id, userId);
  }
}
