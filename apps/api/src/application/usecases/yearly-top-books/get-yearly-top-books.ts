import { Injectable } from '@nestjs/common';
import {
  IYearlyTopBookRepository,
  YearlyTopBookWithBook,
} from '../../../domain/repositories/yearly-top-book';

@Injectable()
export class GetYearlyTopBooksUseCase {
  constructor(
    private readonly yearlyTopBookRepository: IYearlyTopBookRepository,
  ) {}

  async execute(
    userId: string,
    year: string,
  ): Promise<YearlyTopBookWithBook[]> {
    return await this.yearlyTopBookRepository.findByUserIdAndYear(userId, year);
  }
}
