import { Injectable } from '@nestjs/common';
import { ILikeRepository, LikeActor } from '../../../domain/repositories/like';
import { INotificationRepository } from '../../../domain/repositories/notification';

@Injectable()
export class LikeBookUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(actor: LikeActor, bookId: number): Promise<number> {
    const { created, bookOwnerId } = await this.likeRepository.like(
      actor,
      bookId,
    );
    if (created && bookOwnerId) {
      await this.notificationRepository.create({
        userId: bookOwnerId,
        actorId: actor.kind === 'user' ? actor.userId : null,
        actorAnonymousId: actor.kind === 'anonymous' ? actor.anonymousId : null,
        type: 'like',
        bookId,
      });
    }
    return this.likeRepository.countByBook(bookId);
  }
}
