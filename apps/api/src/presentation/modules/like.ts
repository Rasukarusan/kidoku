import { Module } from '@nestjs/common';
import { LikeResolver } from '../resolvers/like';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { LikeRepository } from '../../infrastructure/repositories/like';
import { NotificationRepository } from '../../infrastructure/repositories/notification';
import { ILikeRepository } from '../../domain/repositories/like';
import { INotificationRepository } from '../../domain/repositories/notification';
import { LikeBookUseCase } from '../../application/usecases/likes/like-book';
import { UnlikeBookUseCase } from '../../application/usecases/likes/unlike-book';
import { GetMyLikedBookIdsUseCase } from '../../application/usecases/likes/get-my-liked-book-ids';

@Module({
  imports: [AuthModule],
  providers: [
    LikeResolver,
    LikeBookUseCase,
    UnlikeBookUseCase,
    GetMyLikedBookIdsUseCase,
    {
      provide: ILikeRepository,
      useClass: LikeRepository,
    },
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
  ],
})
export class LikeModule {}
