import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ILikeRepository, LikeActor } from '../../domain/repositories/like';

@Injectable()
export class LikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async like(
    actor: LikeActor,
    bookId: number,
  ): Promise<{ created: boolean; bookOwnerId: string | null }> {
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
      select: { userId: true },
    });
    if (!book) return { created: false, bookOwnerId: null };

    // 自分の本にはいいねできない（所有者を判定できるログインユーザーのみ対象）
    if (actor.kind === 'user' && book.userId === actor.userId) {
      return { created: false, bookOwnerId: book.userId };
    }

    const existing = await this.prisma.like.findUnique({
      where: this.uniqueWhere(actor, bookId),
    });
    if (existing) return { created: false, bookOwnerId: book.userId };

    await this.prisma.like.create({
      data:
        actor.kind === 'user'
          ? { userId: actor.userId, bookId }
          : { anonymousId: actor.anonymousId, bookId },
    });
    return { created: true, bookOwnerId: book.userId };
  }

  async unlike(actor: LikeActor, bookId: number): Promise<void> {
    await this.prisma.like.deleteMany({
      where: this.actorWhere(actor, bookId),
    });
  }

  async getLikedBookIds(actor: LikeActor): Promise<number[]> {
    const likes = await this.prisma.like.findMany({
      where:
        actor.kind === 'user'
          ? { userId: actor.userId }
          : { anonymousId: actor.anonymousId },
      select: { bookId: true },
    });
    return likes.map((l) => l.bookId);
  }

  async countByBook(bookId: number): Promise<number> {
    return this.prisma.like.count({ where: { bookId } });
  }

  /** findUnique 用の複合ユニークキー */
  private uniqueWhere(actor: LikeActor, bookId: number) {
    return actor.kind === 'user'
      ? { userId_bookId: { userId: actor.userId, bookId } }
      : { anonymousId_bookId: { anonymousId: actor.anonymousId, bookId } };
  }

  /** deleteMany 用の通常 where */
  private actorWhere(actor: LikeActor, bookId: number) {
    return actor.kind === 'user'
      ? { userId: actor.userId, bookId }
      : { anonymousId: actor.anonymousId, bookId };
  }
}
