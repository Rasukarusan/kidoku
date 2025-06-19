import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, desc, count } from 'drizzle-orm';
import { INJECTION_TOKENS } from '../../constants/injection-tokens';
import { books } from '../../database/schema/books.schema';
import { users } from '../../database/schema/users.schema';
import { sheets } from '../../database/schema/sheets.schema';
import { GetCommentsInput } from './dto/get-comments.input';
import { CommentObject } from './dto/comment.object';
import { CommentsResponseDto } from './dto/comments-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(INJECTION_TOKENS.DRIZZLE) private readonly db: MySql2Database<any>,
  ) {}

  async getComments(input: GetCommentsInput): Promise<CommentsResponseDto> {
    const { limit, offset } = input;

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
    const commentObjects: CommentObject[] = comments.map((comment) => ({
      id: comment.id.toString(),
      title: comment.title,
      memo: this.maskMemo(comment.memo),
      image: comment.image,
      updated: comment.updated,
      username: comment.username || '',
      userImage: comment.userImage || undefined,
      sheet: comment.sheetName,
    }));

    return {
      comments: commentObjects,
      hasMore,
      total,
    };
  }

  private maskMemo(memo: string): string {
    // **で囲まれた部分をマスキング
    return memo.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      return '**' + '*'.repeat(content.length) + '**';
    });
  }
}
