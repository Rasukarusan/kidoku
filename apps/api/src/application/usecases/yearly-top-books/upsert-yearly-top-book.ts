import { Injectable } from '@nestjs/common';
import { IYearlyTopBookRepository } from '../../../domain/repositories/yearly-top-book';

@Injectable()
export class UpsertYearlyTopBookUseCase {
  constructor(
    private readonly yearlyTopBookRepository: IYearlyTopBookRepository,
  ) {}

  async execute(
    userId: string,
    year: string,
    order: number,
    bookId: number,
  ): Promise<void> {
    await this.yearlyTopBookRepository.upsert(userId, year, order, bookId);
  }
}
