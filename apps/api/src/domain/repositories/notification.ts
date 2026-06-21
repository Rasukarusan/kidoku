import { PaginatedResult } from '../types/paginated-result';
import { NotificationItem } from '../types/social';

export interface CreateNotificationParams {
  userId: string;
  actorId: string;
  type: 'follow' | 'like' | 'comment';
  bookId?: number | null;
}

export abstract class INotificationRepository {
  abstract create(params: CreateNotificationParams): Promise<void>;
  abstract findByUser(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<NotificationItem>>;
  abstract countUnread(userId: string): Promise<number>;
  abstract markAllRead(userId: string): Promise<void>;
}
