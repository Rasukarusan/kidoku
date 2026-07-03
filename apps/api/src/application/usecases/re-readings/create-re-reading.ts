import { Injectable, NotFoundException } from '@nestjs/common';
import { ReReading } from '../../../domain/models/re-reading';
import { IReReadingRepository } from '../../../domain/repositories/re-reading';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class CreateReReadingUseCase {
  constructor(
    private readonly reReadingRepository: IReReadingRepository,
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(params: {
    userId: string;
    bookId: number;
    finished: Date;
    memo: string | null;
  }): Promise<ReReading> {
    const book = await this.bookRepository.findById(String(params.bookId));
    if (!book || book.userId !== params.userId) {
      throw new NotFoundException('本が見つかりません');
    }
    const reReading = ReReading.create(params);
    return await this.reReadingRepository.save(reReading);
  }
}
