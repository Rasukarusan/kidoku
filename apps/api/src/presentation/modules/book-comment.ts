import { Module } from '@nestjs/common';
import { BookCommentResolver } from '../resolvers/book-comment';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { BookCommentRepository } from '../../infrastructure/repositories/book-comment';
import { NotificationRepository } from '../../infrastructure/repositories/notification';
import { IBookCommentRepository } from '../../domain/repositories/book-comment';
import { INotificationRepository } from '../../domain/repositories/notification';
import { CreateBookCommentUseCase } from '../../application/usecases/book-comments/create-book-comment';
import { GetBookCommentsUseCase } from '../../application/usecases/book-comments/get-book-comments';
import { DeleteBookCommentUseCase } from '../../application/usecases/book-comments/delete-book-comment';

@Module({
  imports: [AuthModule],
  providers: [
    BookCommentResolver,
    CreateBookCommentUseCase,
    GetBookCommentsUseCase,
    DeleteBookCommentUseCase,
    {
      provide: IBookCommentRepository,
      useClass: BookCommentRepository,
    },
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
  ],
})
export class BookCommentModule {}
