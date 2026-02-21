export interface YearlyTopBookWithBook {
  year: string;
  order: number;
  book: {
    id: number;
    title: string;
    author: string;
    image: string;
  };
}

export abstract class IYearlyTopBookRepository {
  abstract findByUserIdAndYear(
    userId: string,
    year: string,
  ): Promise<YearlyTopBookWithBook[]>;

  abstract upsert(
    userId: string,
    year: string,
    order: number,
    bookId: number,
  ): Promise<void>;

  abstract delete(userId: string, year: string, order: number): Promise<void>;
}
