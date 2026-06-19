import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../../domain/repositories/notification';
import { PaginatedResult } from '../../../domain/types/paginated-result';
import { NotificationItem } from '../../../domain/types/social';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<NotificationItem>> {
    return this.notificationRepository.findByUser(userId, limit, offset);
  }
}
