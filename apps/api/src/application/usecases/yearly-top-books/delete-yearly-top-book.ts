import { Injectable } from '@nestjs/common';
import { IYearlyTopBookRepository } from '../../../domain/repositories/yearly-top-book';

@Injectable()
export class DeleteYearlyTopBookUseCase {
  constructor(
    private readonly yearlyTopBookRepository: IYearlyTopBookRepository,
  ) {}

  async execute(userId: string, year: string, order: number): Promise<void> {
    await this.yearlyTopBookRepository.delete(userId, year, order);
  }
}
