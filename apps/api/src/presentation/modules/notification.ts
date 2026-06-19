import { Module } from '@nestjs/common';
import { NotificationResolver } from '../resolvers/notification';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { NotificationRepository } from '../../infrastructure/repositories/notification';
import { INotificationRepository } from '../../domain/repositories/notification';
import { GetNotificationsUseCase } from '../../application/usecases/notifications/get-notifications';
import { GetUnreadCountUseCase } from '../../application/usecases/notifications/get-unread-count';
import { MarkNotificationsReadUseCase } from '../../application/usecases/notifications/mark-notifications-read';

@Module({
  imports: [AuthModule],
  providers: [
    NotificationResolver,
    GetNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationsReadUseCase,
    {
      provide: INotificationRepository,
      useClass: NotificationRepository,
    },
  ],
})
export class NotificationModule {}
