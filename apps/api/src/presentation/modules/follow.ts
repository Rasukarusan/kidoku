import { Module } from '@nestjs/common';
import { FollowResolver } from '../resolvers/follow';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { FollowRepository } from '../../infrastructure/repositories/follow';
import { NotificationRepository } from '../../infrastructure/repositories/notification';
import { IFollowRepository } from '../../domain/repositories/follow';
import { INotificationRepository } from '../../domain/repositories/notification';
import { FollowUserUseCase } from '../../application/usecases/follows/follow-user';
import { UnfollowUserUseCase } from '../../application/usecases/follows/unfollow-user';
import { GetFollowInfoUseCase } from '../../application/usecases/follows/get-follow-info';
import { GetFeedUseCase } from '../../application/usecases/follows/get-feed';

@Module({
  imports: [AuthModule],
  providers: [
    FollowResolver,
    FollowUserUseCase,
    UnfollowUserUseCase,
    GetFollowInfoUseCase,
    GetFeedUseCase,
    {
      provide: IFollowRepository,
      useClass: FollowRepository,
    },
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
  ],
})
export class FollowModule {}
