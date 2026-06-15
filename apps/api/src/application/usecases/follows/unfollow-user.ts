import { Injectable } from '@nestjs/common';
import { IFollowRepository } from '../../../domain/repositories/follow';

@Injectable()
export class UnfollowUserUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(followerId: string, followingId: string): Promise<boolean> {
    await this.followRepository.unfollow(followerId, followingId);
    return true;
  }
}
