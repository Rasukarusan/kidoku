import { Injectable } from '@nestjs/common';
import { IFollowRepository } from '../../../domain/repositories/follow';

export interface FollowInfo {
  followers: number;
  following: number;
  isFollowing: boolean;
}

@Injectable()
export class GetFollowInfoUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  /**
   * 名前で指定したユーザーのフォロー情報を取得する。
   * viewerId が渡された場合は、そのユーザーがフォロー中かどうかも返す。
   */
  async execute(name: string, viewerId?: string): Promise<FollowInfo> {
    const targetId = await this.followRepository.findUserIdByName(name);
    if (!targetId) {
      return { followers: 0, following: 0, isFollowing: false };
    }
    const [followers, following, isFollowing] = await Promise.all([
      this.followRepository.countFollowers(targetId),
      this.followRepository.countFollowing(targetId),
      viewerId
        ? this.followRepository.isFollowing(viewerId, targetId)
        : Promise.resolve(false),
    ]);
    return { followers, following, isFollowing };
  }
}
