import { Injectable, NotFoundException } from '@nestjs/common';
import { RatingAxis } from '../../../domain/models/rating-axis';
import { IRatingAxisRepository } from '../../../domain/repositories/rating-axis';
import { IBookRepository } from '../../../domain/repositories/book';

@Injectable()
export class SetBookRatingUseCase {
  constructor(
    private readonly ratingAxisRepository: IRatingAxisRepository,
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(params: {
    userId: string;
    bookId: number;
    axisId: number;
    value: number | null;
  }): Promise<void> {
    const book = await this.bookRepository.findById(String(params.bookId));
    if (!book || book.userId !== params.userId) {
      throw new NotFoundException('本が見つかりません');
    }
    if (params.value !== null) {
      RatingAxis.validateValue(params.value);
    }
    await this.ratingAxisRepository.setRating(
      params.bookId,
      params.axisId,
      params.userId,
      params.value,
    );
  }
}
