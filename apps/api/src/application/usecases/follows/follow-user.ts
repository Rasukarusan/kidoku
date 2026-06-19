import { Injectable, BadRequestException } from '@nestjs/common';
import { IFollowRepository } from '../../../domain/repositories/follow';
import { INotificationRepository } from '../../../domain/repositories/notification';

@Injectable()
export class FollowUserUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw new BadRequestException('自分自身はフォローできません');
    }
    const { created } = await this.followRepository.follow(
      followerId,
      followingId,
    );
    if (created) {
      await this.notificationRepository.create({
        userId: followingId,
        actorId: followerId,
        type: 'follow',
      });
    }
    return true;
  }
}
