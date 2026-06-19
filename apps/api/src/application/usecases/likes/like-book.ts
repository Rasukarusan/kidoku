import { Injectable } from '@nestjs/common';
import { ILikeRepository } from '../../../domain/repositories/like';
import { INotificationRepository } from '../../../domain/repositories/notification';

@Injectable()
export class LikeBookUseCase {
  constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string, bookId: number): Promise<number> {
    const { created, bookOwnerId } = await this.likeRepository.like(
      userId,
      bookId,
    );
    if (created && bookOwnerId) {
      await this.notificationRepository.create({
        userId: bookOwnerId,
        actorId: userId,
        type: 'like',
        bookId,
      });
    }
    return this.likeRepository.countByBook(bookId);
  }
}
