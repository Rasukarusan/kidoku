import { PaginatedResult } from '../types/paginated-result';
import { FeedBook } from '../types/social';

export abstract class IFollowRepository {
  /** フォローする。新規作成された場合はフォロー対象のユーザーIDを返す（既にフォロー済みならnull） */
  abstract follow(
    followerId: string,
    followingId: string,
  ): Promise<{ created: boolean }>;
  abstract unfollow(followerId: string, followingId: string): Promise<void>;
  abstract isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean>;
  abstract countFollowers(userId: string): Promise<number>;
  abstract countFollowing(userId: string): Promise<number>;
  abstract findUserIdByName(name: string): Promise<string | null>;
  abstract getFeedBooks(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<FeedBook>>;
}
