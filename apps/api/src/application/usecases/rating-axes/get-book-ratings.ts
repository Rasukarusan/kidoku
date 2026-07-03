import { Injectable } from '@nestjs/common';
import { IRatingAxisRepository } from '../../../domain/repositories/rating-axis';
import { BookAxisRating } from '../../../domain/types/rating';

@Injectable()
export class GetBookRatingsUseCase {
  constructor(private readonly ratingAxisRepository: IRatingAxisRepository) {}

  async execute(bookId: number, userId: string): Promise<BookAxisRating[]> {
    return await this.ratingAxisRepository.findRatingsByBookId(bookId, userId);
  }
}
