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
    // 自分自身の操作では通知しない（ログインユーザーのみ該当）
    if (params.actorId && params.userId === params.actorId) return;

    const { userId, actorId = null, actorAnonymousId = null, type } = params;

    // 匿名操作者の通知。
    // (受信者・匿名操作者・種別・本) で集約するが、ユニーク制約は actorId(NULL) を
    // 含むため MySQL では NULL 同士が別物扱いとなり upsert で集約できない。
    // そのため明示的に検索→更新／作成して重複作成を防ぐ。
    if (actorAnonymousId) {
      if (params.bookId != null) {
        const existing = await this.prisma.notification.findFirst({
          where: { userId, actorAnonymousId, type, bookId: params.bookId },
          select: { id: true },
        });
        if (existing) {
          await this.prisma.notification.update({
            where: { id: existing.id },
            data: { read: false, created: new Date() },
          });
          return;
        }
      }
      await this.prisma.notification.create({
        data: {
          userId,
          actorId: null,
          actorAnonymousId,
          type,
          bookId: params.bookId ?? null,
        },
      });
      return;
    }

    // 操作者を特定できない通知は作成しない
    if (!actorId) return;

    // 本に紐づく通知（いいね等）は (受信者・操作者・種別・本) ごとに1件に集約する。
    // いいね→いいね解除→再いいねを繰り返しても通知が重複作成されないようにし、
    // 再操作時は既存通知を最新化（未読に戻す）する。
    if (params.bookId != null) {
      const bookId = params.bookId;
      await this.prisma.notification.upsert({
        where: {
          userId_actorId_type_bookId: { userId, actorId, type, bookId },
        },
        create: { userId, actorId, type, bookId },
        update: { read: false, created: new Date() },
      });
      return;
    }

    await this.prisma.notification.create({
      data: { userId, actorId, type, bookId: null },
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
      // actor が null の通知は未ログインユーザーによる操作（匿名）
      actorName: n.actor?.name || '匿名ユーザー',
      actorImage: n.actor?.image || null,
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
