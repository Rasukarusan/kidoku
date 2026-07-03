export interface BookSearchItem {
  id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  /** 発売日（著者検索時のみ設定される。例: 2026年01月15日） */
  salesDate?: string;
}

export abstract class IBookSearchRepository {
  abstract searchByTitle(query: string): Promise<BookSearchItem[]>;
  /** 著者名で発売日の新しい順に検索する */
  abstract searchByAuthor(author: string): Promise<BookSearchItem[]>;
}
