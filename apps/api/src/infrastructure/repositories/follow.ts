import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IFollowRepository } from '../../domain/repositories/follow';
import { PaginatedResult } from '../../domain/types/paginated-result';
import { FeedBook } from '../../domain/types/social';

@Injectable()
export class FollowRepository implements IFollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async follow(
    followerId: string,
    followingId: string,
  ): Promise<{ created: boolean }> {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) return { created: false };
    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { created: true };
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return existing !== null;
  }

  async countFollowers(userId: string): Promise<number> {
    return this.prisma.follow.count({ where: { followingId: userId } });
  }

  async countFollowing(userId: string): Promise<number> {
    return this.prisma.follow.count({ where: { followerId: userId } });
  }

  async findUserIdByName(name: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { name },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  async getFeedBooks(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<PaginatedResult<FeedBook>> {
    const where = {
      isPublicMemo: true,
      user: { followers: { some: { followerId: userId } } },
    };
    const [results, total] = await Promise.all([
      this.prisma.books.findMany({
        where,
        select: {
          id: true,
          title: true,
          author: true,
          memo: true,
          image: true,
          updated: true,
          user: { select: { name: true, image: true } },
          sheet: { select: { name: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { updated: 'desc' },
        take: limit + 1,
        skip: offset,
      }),
      this.prisma.books.count({ where }),
    ]);

    const hasMore = results.length > limit;
    const items = (hasMore ? results.slice(0, limit) : results).map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      image: b.image,
      memo: this.maskMemo(b.memo),
      updated: b.updated,
      username: b.user.name || '',
      userImage: b.user.image || null,
      sheet: b.sheet.name,
      likeCount: b._count.likes,
    }));

    return { items, hasMore, total };
  }

  private maskMemo(memo: string): string {
    const pattern = /\[\[MASK:\s*(.*?)\]\]/g;
    const escapedPattern = /\\\[\\\[MASK:\s*(.*?)\\\]\\\]/g;
    return memo.replace(pattern, '*****').replace(escapedPattern, '*****');
  }
}
