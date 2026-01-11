import { Inject, Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { books } from '../database/schema/books.schema';
import { sheets } from '../database/schema/sheets.schema';
import { users } from '../database/schema/users.schema';
import { DrizzleDb } from '../database/types';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { Book } from '../../domain/models/book';
import { IBookRepository } from '../../domain/repositories/book';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(
    @Inject(INJECTION_TOKENS.DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async findById(id: string): Promise<Book | null> {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      return null;
    }

    const rows = await this.db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (rows.length === 0) return null;

    return this.toEntity(rows[0]);
  }

  async findByUserId(userId: string): Promise<Book[]> {
    const rows = await this.db
      .select()
      .from(books)
      .where(eq(books.userId, userId));

    return rows.map((row) => this.toEntity(row));
  }

  async findBySheetId(sheetId: number): Promise<Book[]> {
    const rows = await this.db
      .select()
      .from(books)
      .where(eq(books.sheetId, sheetId));

    return rows.map((row) => this.toEntity(row));
  }

  async findByUserIdAndSheetId(
    userId: string,
    sheetId: number,
  ): Promise<Book[]> {
    const rows = await this.db
      .select()
      .from(books)
      .where(and(eq(books.userId, userId), eq(books.sheetId, sheetId)));

    return rows.map((row) => this.toEntity(row));
  }

  async save(book: Book): Promise<Book> {
    if (book.id === null) {
      // 新規作成
      const result = (await this.db.insert(books).values({
        userId: book.userId,
        sheetId: book.sheetId,
        title: book.title,
        author: book.author,
        category: book.category,
        image: book.image,
        impression: book.impression,
        memo: book.memo,
        isPublicMemo: book.isPublicMemo ? 1 : 0,
        isPurchasable: book.isPurchasable ? 1 : 0,
        finished: book.finished,
        created: book.created,
        updated: book.updated,
      })) as unknown as Array<{ insertId: number }>;

      // Drizzle MySQLの戻り値から insertId を取得
      if (!result?.[0]?.insertId || typeof result[0].insertId !== 'number') {
        throw new Error('Failed to create book: No insertId returned');
      }

      const insertId = result[0].insertId;
      return Book.fromDatabase(
        insertId.toString(),
        book.userId,
        book.sheetId,
        book.title,
        book.author,
        book.category,
        book.image,
        book.impression,
        book.memo,
        book.isPublicMemo,
        book.isPurchasable,
        book.finished,
        book.created,
        book.updated,
      );
    } else {
      // 更新
      const bookId = parseInt(book.id, 10);
      if (isNaN(bookId) || bookId <= 0) {
        throw new Error('Invalid book ID');
      }

      await this.db
        .update(books)
        .set({
          sheetId: book.sheetId,
          title: book.title,
          author: book.author,
          category: book.category,
          image: book.image,
          impression: book.impression,
          memo: book.memo,
          isPublicMemo: book.isPublicMemo ? 1 : 0,
          isPurchasable: book.isPurchasable ? 1 : 0,
          finished: book.finished,
          updated: book.updated,
        })
        .where(eq(books.id, bookId));

      return book;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      throw new Error('Invalid book ID');
    }

    await this.db
      .delete(books)
      .where(and(eq(books.id, bookId), eq(books.userId, userId)));
  }

  async findAllForSearch(): Promise<
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
  > {
    const rows = await this.db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        image: books.image,
        memo: books.memo,
        isPublicMemo: books.isPublicMemo,
        userName: users.name,
        userImage: users.image,
        sheetName: sheets.name,
      })
      .from(books)
      .leftJoin(users, eq(books.userId, users.id))
      .leftJoin(sheets, eq(books.sheetId, sheets.id))
      .where(sql`${sheets.id} IS NOT NULL`); // sheetがnullのレコードを除外

    return rows.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      author: row.author,
      image: row.image,
      memo: row.isPublicMemo ? row.memo : '',
      isPublicMemo: row.isPublicMemo === 1,
      userName: row.userName || '',
      userImage: row.userImage,
      sheetName: row.sheetName || '',
    }));
  }

  async findForSearchById(id: string): Promise<{
    id: string;
    title: string;
    author: string;
    image: string;
    memo: string;
    isPublicMemo: boolean;
    userName: string;
    userImage: string | null;
    sheetName: string | null;
  } | null> {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      return null;
    }

    const rows = await this.db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        image: books.image,
        memo: books.memo,
        isPublicMemo: books.isPublicMemo,
        userName: users.name,
        userImage: users.image,
        sheetName: sheets.name,
      })
      .from(books)
      .leftJoin(users, eq(books.userId, users.id))
      .leftJoin(sheets, eq(books.sheetId, sheets.id))
      .where(eq(books.id, bookId))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id.toString(),
      title: row.title,
      author: row.author,
      image: row.image,
      memo: row.isPublicMemo ? row.memo : '',
      isPublicMemo: row.isPublicMemo === 1,
      userName: row.userName || '',
      userImage: row.userImage,
      sheetName: row.sheetName,
    };
  }

  async getCategories(userId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ category: books.category })
      .from(books)
      .where(eq(books.userId, userId));

    return rows.map((row) => row.category).filter((c) => c && c.trim() !== '');
  }

  private toEntity(row: typeof books.$inferSelect): Book {
    return Book.fromDatabase(
      row.id.toString(),
      row.userId,
      row.sheetId,
      row.title,
      row.author,
      row.category,
      row.image,
      row.impression,
      row.memo,
      row.isPublicMemo === 1,
      row.isPurchasable === 1,
      row.finished ?? null,
      row.created ?? new Date(),
      row.updated ?? new Date(),
    );
  }
}
