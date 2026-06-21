/**
 * いいねの操作主体。
 * ログインユーザーは userId、未ログイン（匿名）ユーザーは Cookie 由来の anonymousId で識別する。
 */
export type LikeActor =
  | { kind: 'user'; userId: string }
  | { kind: 'anonymous'; anonymousId: string };

export abstract class ILikeRepository {
  /** いいねする。新規作成かどうかと本の所有者IDを返す */
  abstract like(
    actor: LikeActor,
    bookId: number,
  ): Promise<{ created: boolean; bookOwnerId: string | null }>;
  abstract unlike(actor: LikeActor, bookId: number): Promise<void>;
  abstract getLikedBookIds(actor: LikeActor): Promise<number[]>;
  abstract countByBook(bookId: number): Promise<number>;
}
