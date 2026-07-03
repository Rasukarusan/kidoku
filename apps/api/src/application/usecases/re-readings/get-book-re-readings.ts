import { Injectable } from '@nestjs/common';
import { ReReading } from '../../../domain/models/re-reading';
import { IReReadingRepository } from '../../../domain/repositories/re-reading';

@Injectable()
export class GetBookReReadingsUseCase {
  constructor(private readonly reReadingRepository: IReReadingRepository) {}

  async execute(bookId: number, userId: string): Promise<ReReading[]> {
    return await this.reReadingRepository.findByBookId(bookId, userId);
  }
}
