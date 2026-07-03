export interface BookSearchItem {
  id: string;
  title: string;
  author: string;
  category: string;
  image: string;
}

export abstract class IBookSearchRepository {
  abstract searchByTitle(query: string): Promise<BookSearchItem[]>;
}
