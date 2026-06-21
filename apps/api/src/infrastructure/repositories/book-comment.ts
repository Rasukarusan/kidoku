import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BookComment } from '../../domain/models/book-comment';
import { IBookCommentRepository } from '../../domain/repositories/book-comment';
import { PaginatedResult } from '../../domain/types/paginated-result';

@Injectable()
export class BookCommentRepository implements IBookCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    comment: BookComment,
  ): Promise<{ comment: BookComment; bookOwnerId: string | null }> {
    const book = await this.prisma.books.findUnique({
      where: { id: comment.bookId },
      select: { userId: true },
    });
    if (!book) {
      throw new Error('書籍が見つかりません');
    }

    const created = await this.prisma.bookComment.create({
      data: {
        bookId: comment.bookId,
        userId: comment.userId,
        content: comment.content,
      },
      select: {
        id: true,
        bookId: true,
        userId: true,
        content: true,
        created: true,
        updated: true,
        user: { select: { name: true, image: true } },
      },
    });

    return {
      comment: BookComment.fromDatabase(
        created.id,
        created.bookId,
        created.userId,
        created.content,
        created.created,
        created.updated,
        created.user.name || '',
        created.user.image || null,
      ),
      bookOwnerId: book.userId,
    };
  }

  async findByBook(
    bookId: number,
    limit = 20,
    offset = 0,
  ): Promise<PaginatedResult<BookComment>> {
    const [results, total] = await Promise.all([
      this.prisma.bookComment.findMany({
        where: { bookId },
        select: {
          id: true,
          bookId: true,
          userId: true,
          content: true,
          created: true,
          updated: true,
          user: { select: { name: true, image: true } },
        },
        orderBy: { created: 'desc' },
        take: limit + 1,
        skip: offset,
      }),
      this.prisma.bookComment.count({ where: { bookId } }),
    ]);

    const hasMore = results.length > limit;
    const page = hasMore ? results.slice(0, limit) : results;

    const items = page.map((c) =>
      BookComment.fromDatabase(
        c.id,
        c.bookId,
        c.userId,
        c.content,
        c.created,
        c.updated,
        c.user.name || '',
        c.user.image || null,
      ),
    );

    return { items, hasMore, total };
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const comment = await this.prisma.bookComment.findUnique({
      where: { id },
      select: { userId: true, book: { select: { userId: true } } },
    });
    if (!comment) return false;

    // コメント投稿者または本の所有者のみ削除可能
    const isAuthor = comment.userId === userId;
    const isBookOwner = comment.book.userId === userId;
    if (!isAuthor && !isBookOwner) return false;

    await this.prisma.bookComment.delete({ where: { id } });
    return true;
  }

  async countByBook(bookId: number): Promise<number> {
    return this.prisma.bookComment.count({ where: { bookId } });
  }
}
