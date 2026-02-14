export interface GoogleBookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  image: string;
}

export abstract class IGoogleBooksRepository {
  abstract searchByTitle(query: string): Promise<GoogleBookItem[]>;
}
