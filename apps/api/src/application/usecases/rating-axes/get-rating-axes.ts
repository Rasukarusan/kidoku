import { Injectable } from '@nestjs/common';
import { RatingAxis } from '../../../domain/models/rating-axis';
import { IRatingAxisRepository } from '../../../domain/repositories/rating-axis';

@Injectable()
export class GetRatingAxesUseCase {
  constructor(private readonly ratingAxisRepository: IRatingAxisRepository) {}

  async execute(userId: string): Promise<RatingAxis[]> {
    return await this.ratingAxisRepository.findByUserId(userId);
  }
}
