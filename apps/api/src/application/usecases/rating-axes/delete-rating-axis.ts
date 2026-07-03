import { Injectable } from '@nestjs/common';
import { IRatingAxisRepository } from '../../../domain/repositories/rating-axis';

@Injectable()
export class DeleteRatingAxisUseCase {
  constructor(private readonly ratingAxisRepository: IRatingAxisRepository) {}

  async execute(id: number, userId: string): Promise<void> {
    await this.ratingAxisRepository.delete(id, userId);
  }
}
