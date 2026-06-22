import { Injectable } from '@nestjs/common';
import { BookComment } from '../../../domain/models/book-comment';
import { IBookCommentRepository } from '../../../domain/repositories/book-comment';
import { INotificationRepository } from '../../../domain/repositories/notification';

@Injectable()
export class CreateBookCommentUseCase {
  constructor(
    private readonly bookCommentRepository: IBookCommentRepository,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    userId: string,
    bookId: number,
    content: string,
  ): Promise<BookComment> {
    const comment = BookComment.create({ userId, bookId, content });
    const { comment: created, bookOwnerId } =
      await this.bookCommentRepository.create(comment);

    // 本の所有者にコメント通知を送る（自分の本へのコメントは通知されない）
    if (bookOwnerId) {
      await this.notificationRepository.create({
        userId: bookOwnerId,
        actorId: userId,
        type: 'comment',
        bookId,
      });
    }

    return created;
  }
}
