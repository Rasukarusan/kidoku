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
    const isBookPublic = await this.bookCommentRepository.isBookPublic(bookId);
    if (isBookPublic === null) {
      throw new Error('書籍が見つかりません');
    }
    if (!isBookPublic) {
      throw new Error('非公開の書籍にはコメントできません');
    }

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
