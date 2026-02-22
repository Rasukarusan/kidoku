import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Comment } from '../../domain/models/comment';
import { ICommentRepository } from '../../domain/repositories/comment';
import { PaginatedResult } from '../../domain/types/paginated-result';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicComments(
    limit = 20,
    offset = 0,
  ): Promise<PaginatedResult<Comment>> {
    const [results, total] = await Promise.all([
      this.prisma.books.findMany({
        where: { isPublicMemo: true },
        select: {
          id: true,
          title: true,
          memo: true,
          image: true,
          updated: true,
          user: { select: { name: true, image: true } },
          sheet: { select: { name: true } },
        },
        orderBy: { updated: 'desc' },
        take: limit + 1,
        skip: offset,
      }),
      this.prisma.books.count({
        where: { isPublicMemo: true },
      }),
    ]);

    const hasMore = results.length > limit;
    const comments = hasMore ? results.slice(0, limit) : results;

    const commentObjects = comments.map((comment) => {
      return Comment.fromDatabase(
        comment.id.toString(),
        comment.title,
        this.maskMemo(comment.memo),
        comment.image,
        comment.updated,
        comment.user.name || '',
        comment.user.image || null,
        comment.sheet.name,
      );
    });

    return {
      items: commentObjects,
      hasMore,
      total,
    };
  }

  private maskMemo(memo: string): string {
    const pattern = /\[\[MASK:\s*(.*?)\]\]/g;
    const escapedPattern = /\\\[\\\[MASK:\s*(.*?)\\\]\\\]/g;
    return memo.replace(pattern, '*****').replace(escapedPattern, '*****');
  }
}
