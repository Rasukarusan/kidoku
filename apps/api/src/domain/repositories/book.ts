import { Book } from '../models/book';

export abstract class IBookRepository {
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
    image: string;
    memo: string;
    isPublicMemo: boolean;
    userName: string;
    userImage: string | null;
    sheetName: string | null;
  } | null>;
  abstract getCategories(userId: string): Promise<string[]>;
}
