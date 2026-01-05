import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, count } from 'drizzle-orm';
import { sheets } from '../database/schema/sheets.schema';
import { users } from '../../infrastructure/database/schema/users.schema';
import { DrizzleDb } from '../database/types';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { Comment } from '../../domain/models/comment';
import { ICommentRepository } from '../../domain/repositories/comment';
import { books } from '../database/schema';
import { PaginatedResult } from '../../domain/types/paginated-result';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @Inject(INJECTION_TOKENS.DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async findPublicComments(
    limit = 20,
    offset = 0,
  ): Promise<PaginatedResult<Comment>> {
    // コメント一覧を取得（公開メモのみ）
    const commentsQuery = this.db
      .select({
        id: books.id,
        title: books.title,
        memo: books.memo,
        image: books.image,
        updated: books.updated,
        username: users.name,
        userImage: users.image,
        sheetName: sheets.name,
      })
      .from(books)
      .innerJoin(users, eq(books.userId, users.id))
      .innerJoin(sheets, eq(books.sheetId, sheets.id))
      .where(eq(books.isPublicMemo, 1))
      .orderBy(desc(books.updated))
      .limit(limit + 1) // hasMoreを判定するため+1
      .offset(offset);

    const results = await commentsQuery;

    // hasMoreを判定
    const hasMore = results.length > limit;
    const comments = hasMore ? results.slice(0, limit) : results;

    // 総件数を取得
    const totalResult = await this.db
      .select({ count: count() })
      .from(books)
      .where(eq(books.isPublicMemo, 1));

    const total = totalResult[0]?.count || 0;

    // データを変換
    const commentObjects = comments.map((comment) => {
      return Comment.fromDatabase(
        comment.id.toString(),
        comment.title,
        this.maskMemo(comment.memo),
        comment.image,
        comment.updated,
        comment.username || '',
        comment.userImage || null,
        comment.sheetName,
      );
    });

    return {
      items: commentObjects,
      hasMore,
      total,
    };
  }

  private maskMemo(memo: string): string {
    // [[MASK: text]] をマスキング（エスケープ版も対応）
    const pattern = /\[\[MASK:\s*(.*?)\]\]/g;
    const escapedPattern = /\\\[\\\[MASK:\s*(.*?)\\\]\\\]/g;
    return memo.replace(pattern, '*****').replace(escapedPattern, '*****');
  }
}
