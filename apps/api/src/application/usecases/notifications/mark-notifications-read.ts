import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../../domain/repositories/notification';

@Injectable()
export class MarkNotificationsReadUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<boolean> {
    await this.notificationRepository.markAllRead(userId);
    return true;
  }
}
