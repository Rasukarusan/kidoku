import { Injectable } from '@nestjs/common';
import { RatingAxis } from '../../../domain/models/rating-axis';
import { IRatingAxisRepository } from '../../../domain/repositories/rating-axis';

const MAX_AXES_PER_USER = 10;

@Injectable()
export class CreateRatingAxisUseCase {
  constructor(private readonly ratingAxisRepository: IRatingAxisRepository) {}

  async execute(params: { userId: string; name: string }): Promise<RatingAxis> {
    const existing = await this.ratingAxisRepository.findByUserId(
      params.userId,
    );
    if (existing.length >= MAX_AXES_PER_USER) {
      throw new Error(`評価軸は${MAX_AXES_PER_USER}個まで作成できます`);
    }
    if (existing.some((axis) => axis.name === params.name.trim())) {
      throw new Error('同じ名前の評価軸がすでに存在します');
    }
    const axis = RatingAxis.create({
      userId: params.userId,
      name: params.name,
      order: existing.length + 1,
    });
    return await this.ratingAxisRepository.save(axis);
  }
}
