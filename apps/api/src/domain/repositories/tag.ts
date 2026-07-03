import { TagWithCount, TaggedBook } from '../types/tag';

export abstract class ITagRepository {
  /** ユーザーのタグ一覧を冊数付きで返す */
  abstract findByUserIdWithCount(userId: string): Promise<TagWithCount[]>;
  /** 本に付いているタグ名を返す */
  abstract findNamesByBookId(bookId: number, userId: string): Promise<string[]>;
  /** タグ名に紐づく本を返す */
  abstract findBooksByTagName(
    userId: string,
    tagName: string,
  ): Promise<TaggedBook[]>;
  /**
   * 本のタグを渡された名前一覧で置き換える。
   * 存在しないタグは作成し、どの本にも付かなくなったタグは削除する。
   */
  abstract replaceBookTags(
    bookId: number,
    userId: string,
    tagNames: string[],
  ): Promise<string[]>;
}
