export interface BookSearchDocument {
  id: string;
  title: string;
  author: string;
  image: string;
  memo: string;
  username: string;
  userImage: string | null;
  sheet: string;
}

export interface SearchHit {
  id: string;
  title: string;
  author: string;
  image: string;
  memo: string;
  username: string;
  userImage: string | null;
  sheet: string;
}

export interface SearchResult {
  hits: SearchHit[];
  totalHits: number;
  hitsPerPage: number;
  page: number;
  hasMore: boolean;
}

export abstract class ISearchRepository {
  abstract addDocuments(documents: BookSearchDocument[]): Promise<void>;
  abstract updateDocument(document: BookSearchDocument): Promise<void>;
  abstract search(query: string, page?: number): Promise<SearchResult>;
  abstract deleteDocument(id: string): Promise<void>;
}
