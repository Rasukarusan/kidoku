/**
 * タグ本棚表示用の読み取りプロジェクション型。
 */
export interface TagWithCount {
  id: number;
  name: string;
  bookCount: number;
}

export interface TaggedBook {
  id: number;
  title: string;
  author: string;
  category: string;
  image: string;
  impression: string;
  sheetName: string;
  finished: Date | null;
}
