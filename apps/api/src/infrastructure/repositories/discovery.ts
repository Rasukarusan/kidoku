import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IDiscoveryRepository } from '../../domain/repositories/discovery';
import { PopularBook, TopReader } from '../../domain/types/social';

@Injectable()
export class DiscoveryRepository implements IDiscoveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async weeklyPopularBooks(limit = 10): Promise<PopularBook[]> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weekly = await this.prisma.like.groupBy({
      by: ['bookId'],
      where: { created: { gte: since } },
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
      take: limit,
    });

    // 直近1週間でいいねが無ければ累計で代替
    const grouped =
      weekly.length > 0
        ? weekly
        : await this.prisma.like.groupBy({
            by: ['bookId'],
            where: {},
            _count: { bookId: true },
            orderBy: { _count: { bookId: 'desc' } },
            take: limit,
          });

    if (grouped.length === 0) return [];

    const countMap = new Map<number, number>(
      grouped.map((g) => [g.bookId, g._count.bookId]),
    );
    const bookIds = grouped.map((g) => g.bookId);

    const books = await this.prisma.books.findMany({
      where: { id: { in: bookIds }, isPublicMemo: true },
      select: {
        id: true,
        title: true,
        author: true,
        image: true,
        user: { select: { name: true, image: true } },
        sheet: { select: { name: true } },
      },
    });
    const bookMap = new Map(books.map((b) => [b.id, b]));

    return bookIds
      .map((id) => {
        const b = bookMap.get(id);
        if (!b) return null;
        return {
          id: b.id,
          title: b.title,
          author: b.author,
          image: b.image,
          username: b.user.name || '',
          userImage: b.user.image || null,
          sheet: b.sheet.name,
          likeCount: countMap.get(id) ?? 0,
        };
      })
      .filter((b): b is PopularBook => b !== null);
  }

  async topReaders(limit = 10): Promise<TopReader[]> {
    const grouped = await this.prisma.books.groupBy({
      by: ['userId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: limit + 10,
    });
    if (grouped.length === 0) return [];

    const countMap = new Map<string, number>(
      grouped.map((g) => [g.userId, g._count.userId]),
    );
    const userIds = grouped.map((g) => g.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, name: { not: null } },
      select: { id: true, name: true, image: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return userIds
      .map((id) => {
        const u = userMap.get(id);
        if (!u || !u.name) return null;
        return {
          name: u.name,
          image: u.image || null,
          bookCount: countMap.get(id) ?? 0,
        };
      })
      .filter((u): u is TopReader => u !== null)
      .slice(0, limit);
  }
}
