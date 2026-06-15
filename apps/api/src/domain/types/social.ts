/**
 * ソーシャル機能の読み取り用プロジェクション型。
 * 単純な集計・表示用データのためドメインモデルではなく型で表現する。
 */

export interface FeedBook {
  id: number;
  title: string;
  author: string;
  image: string;
  memo: string;
  updated: Date;
  username: string;
  userImage: string | null;
  sheet: string;
  likeCount: number;
}

export interface PopularBook {
  id: number;
  title: string;
  author: string;
  image: string;
  username: string;
  userImage: string | null;
  sheet: string;
  likeCount: number;
}

export interface TopReader {
  name: string;
  image: string | null;
  bookCount: number;
}

export interface NotificationItem {
  id: number;
  type: string;
  bookId: number | null;
  read: boolean;
  created: Date;
  actorName: string;
  actorImage: string | null;
  bookTitle: string | null;
}
