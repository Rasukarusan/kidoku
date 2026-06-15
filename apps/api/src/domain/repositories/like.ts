export abstract class ILikeRepository {
  /** いいねする。新規作成かどうかと本の所有者IDを返す */
  abstract like(
    userId: string,
    bookId: number,
  ): Promise<{ created: boolean; bookOwnerId: string | null }>;
  abstract unlike(userId: string, bookId: number): Promise<void>;
  abstract getLikedBookIds(userId: string): Promise<number[]>;
  abstract countByBook(bookId: number): Promise<number>;
}
