import { Injectable } from '@nestjs/common';
import { ILikeRepository } from '../../../domain/repositories/like';

@Injectable()
export class GetMyLikedBookIdsUseCase {
  constructor(private readonly likeRepository: ILikeRepository) {}

  async execute(userId: string): Promise<number[]> {
    return this.likeRepository.getLikedBookIds(userId);
  }
}
