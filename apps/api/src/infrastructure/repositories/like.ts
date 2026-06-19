import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ILikeRepository } from '../../domain/repositories/like';

@Injectable()
export class LikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async like(
    userId: string,
    bookId: number,
  ): Promise<{ created: boolean; bookOwnerId: string | null }> {
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
      select: { userId: true },
    });
    if (!book) return { created: false, bookOwnerId: null };

    // 自分の本にはいいねできない
    if (book.userId === userId) {
      return { created: false, bookOwnerId: book.userId };
    }

    const existing = await this.prisma.like.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    if (existing) return { created: false, bookOwnerId: book.userId };

    await this.prisma.like.create({ data: { userId, bookId } });
    return { created: true, bookOwnerId: book.userId };
  }

  async unlike(userId: string, bookId: number): Promise<void> {
    await this.prisma.like.deleteMany({ where: { userId, bookId } });
  }

  async getLikedBookIds(userId: string): Promise<number[]> {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      select: { bookId: true },
    });
    return likes.map((l) => l.bookId);
  }

  async countByBook(bookId: number): Promise<number> {
    return this.prisma.like.count({ where: { bookId } });
  }
}
