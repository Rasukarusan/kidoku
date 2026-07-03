/**
 * 引用ノート表示用の読み取りプロジェクション型。
 * 引用と書籍情報をまとめて返すためドメインモデルではなく型で表現する。
 */
export interface QuoteWithBook {
  id: number;
  bookId: number;
  page: number | null;
  text: string;
  comment: string | null;
  created: Date;
  bookTitle: string;
  bookAuthor: string;
  bookImage: string;
}
