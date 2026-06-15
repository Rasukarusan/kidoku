import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  INotificationRepository,
  CreateNotificationParams,
} from '../../domain/repositories/notification';
import { PaginatedResult } from '../../domain/types/paginated-result';
import { NotificationItem } from '../../domain/types/social';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateNotificationParams): Promise<void> {
    // 自分自身の操作では通知しない
    if (params.userId === params.actorId) return;
    await this.prisma.notification.create({
      data: {
        userId: params.userId,
        actorId: params.actorId,
        type: params.type,
        bookId: params.bookId ?? null,
      },
    });
  }

  async findByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<PaginatedResult<NotificationItem>> {
    const [results, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          bookId: true,
          read: true,
          created: true,
          actor: { select: { name: true, image: true } },
        },
        orderBy: { created: 'desc' },
        take: limit + 1,
        skip: offset,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    const hasMore = results.length > limit;
    const page = hasMore ? results.slice(0, limit) : results;

    // 通知に紐づく本のタイトルをまとめて取得（Notification⇔booksのリレーションは張らず疎結合に保つ）
    const bookIds = Array.from(
      new Set(
        page.map((n) => n.bookId).filter((id): id is number => id !== null),
      ),
    );
    const books =
      bookIds.length > 0
        ? await this.prisma.books.findMany({
            where: { id: { in: bookIds } },
            select: { id: true, title: true },
          })
        : [];
    const titleMap = new Map(books.map((b) => [b.id, b.title]));

    const items = page.map((n) => ({
      id: n.id,
      type: n.type,
      bookId: n.bookId,
      read: n.read,
      created: n.created,
      actorName: n.actor.name || '',
      actorImage: n.actor.image || null,
      bookTitle: n.bookId ? (titleMap.get(n.bookId) ?? null) : null,
    }));

    return { items, hasMore, total };
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
