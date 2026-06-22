import { BookComment } from '../models/book-comment';
import { PaginatedResult } from '../types/paginated-result';

export abstract class IBookCommentRepository {
  /** コメントを作成し、作成されたコメントと本の所有者IDを返す */
  abstract create(
    comment: BookComment,
  ): Promise<{ comment: BookComment; bookOwnerId: string | null }>;

  /** 指定した本のコメント一覧を新しい順に取得する */
  abstract findByBook(
    bookId: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<BookComment>>;

  /** コメントを削除する。削除できた場合は true を返す */
  abstract delete(id: number, userId: string): Promise<boolean>;

  /** 指定した本のコメント件数を返す */
  abstract countByBook(bookId: number): Promise<number>;
}
