import { Book } from '../models/book';

export type ReadingChatBookQuery = {
  ids?: number[];
  searchText?: string;
  authors?: string[];
  categories?: string[];
  finishedFrom?: Date;
  finishedTo?: Date;
  finishedOnly: boolean;
  includeMemo: boolean;
  orderBy: 'recent' | 'oldest' | 'title';
  limit: number;
};

export type ReadingChatBook = {
  title: string;
  author: string;
  category: string;
  impression: string;
  finished: Date | null;
  memo?: string;
};

export abstract class IBookRepository {
  abstract findForReadingChat(
    userId: string,
    query: ReadingChatBookQuery,
  ): Promise<ReadingChatBook[]>;
  abstract findById(id: string): Promise<Book | null>;
  abstract findByUserId(userId: string): Promise<Book[]>;
  abstract findBySheetId(sheetId: number): Promise<Book[]>;
  abstract findByUserIdAndSheetId(
    userId: string,
    sheetId: number,
  ): Promise<Book[]>;
  abstract findByUserIdAndSheetName(
    userId: string,
    sheetName: string,
  ): Promise<Book[]>;
  abstract save(book: Book): Promise<Book>;
  abstract delete(id: string, userId: string): Promise<void>;
  abstract findAllForSearch(): Promise<
    Array<{
      id: string;
      title: string;
      author: string;
      category: string;
      image: string;
      memo: string;
      isPublicMemo: boolean;
      userName: string;
      userImage: string | null;
      sheetName: string;
    }>
  >;
  abstract findForSearchById(id: string): Promise<{
    id: string;
    title: string;
    author: string;
    category: string;
    image: string;
    memo: string;
    isPublicMemo: boolean;
    userName: string;
    userImage: string | null;
    sheetName: string | null;
  } | null>;
  abstract getCategories(userId: string): Promise<string[]>;
}
