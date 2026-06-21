import { PaginatedResult } from '../types/paginated-result';
import { NotificationItem } from '../types/social';

export interface CreateNotificationParams {
  userId: string;
  /** ログインユーザーの操作者ID。匿名操作の場合は null */
  actorId?: string | null;
  /** 匿名（未ログイン）操作者の識別子。ログインユーザーの場合は null */
  actorAnonymousId?: string | null;
  type: 'follow' | 'like';
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
