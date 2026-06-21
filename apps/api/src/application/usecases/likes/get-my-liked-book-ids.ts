import { Injectable } from '@nestjs/common';
import { ILikeRepository, LikeActor } from '../../../domain/repositories/like';

@Injectable()
export class GetMyLikedBookIdsUseCase {
  constructor(private readonly likeRepository: ILikeRepository) {}

  async execute(actor: LikeActor): Promise<number[]> {
    return this.likeRepository.getLikedBookIds(actor);
  }
}
