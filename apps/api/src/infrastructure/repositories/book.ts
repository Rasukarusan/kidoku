import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Book } from '../../domain/models/book';
import { IBookRepository } from '../../domain/repositories/book';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Book | null> {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      return null;
    }

    const row = await this.prisma.books.findUnique({
      where: { id: bookId },
    });

    if (!row) return null;

    return this.toEntity(row);
  }

  async findByUserId(userId: string): Promise<Book[]> {
    const rows = await this.prisma.books.findMany({
      where: { userId },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findBySheetId(sheetId: number): Promise<Book[]> {
    const rows = await this.prisma.books.findMany({
      where: { sheetId: sheetId },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findByUserIdAndSheetId(
    userId: string,
    sheetId: number,
  ): Promise<Book[]> {
    const rows = await this.prisma.books.findMany({
      where: { userId, sheetId: sheetId },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findByUserIdAndSheetName(
    userId: string,
    sheetName: string,
  ): Promise<Book[]> {
    const rows = await this.prisma.books.findMany({
      where: { userId, sheet: { name: sheetName } },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async save(book: Book): Promise<Book> {
    if (book.id === null) {
      const created = await this.prisma.books.create({
        data: {
          userId: book.userId,
          sheetId: book.sheetId,
          title: book.title,
          author: book.author,
          category: book.category,
          image: book.image,
          impression: book.impression,
          memo: book.memo,
          isPublicMemo: book.isPublicMemo,
          isPurchasable: book.isPurchasable,
          finished: book.finished,
          created: book.created,
          updated: book.updated,
        },
      });

      return Book.fromDatabase(
        created.id.toString(),
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
      const bookId = parseInt(book.id, 10);
      if (isNaN(bookId) || bookId <= 0) {
        throw new Error('Invalid book ID');
      }

      await this.prisma.books.update({
        where: { id: bookId },
        data: {
          sheetId: book.sheetId,
          title: book.title,
          author: book.author,
          category: book.category,
          image: book.image,
          impression: book.impression,
          memo: book.memo,
          isPublicMemo: book.isPublicMemo,
          isPurchasable: book.isPurchasable,
          finished: book.finished,
          updated: book.updated,
        },
      });

      return book;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId) || bookId <= 0) {
      throw new Error('Invalid book ID');
    }

    await this.prisma.books.deleteMany({
      where: { id: bookId, userId },
    });
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
    const rows = await this.prisma.books.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        image: true,
        memo: true,
        isPublicMemo: true,
        user: { select: { name: true, image: true } },
        sheet: { select: { name: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      author: row.author,
      image: row.image,
      memo: row.isPublicMemo ? row.memo : '',
      isPublicMemo: row.isPublicMemo,
      userName: row.user.name || '',
      userImage: row.user.image,
      sheetName: row.sheet.name,
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

    const row = await this.prisma.books.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        author: true,
        image: true,
        memo: true,
        isPublicMemo: true,
        user: { select: { name: true, image: true } },
        sheet: { select: { name: true } },
      },
    });

    if (!row) return null;

    return {
      id: row.id.toString(),
      title: row.title,
      author: row.author,
      image: row.image,
      memo: row.isPublicMemo ? row.memo : '',
      isPublicMemo: row.isPublicMemo,
      userName: row.user.name || '',
      userImage: row.user.image,
      sheetName: row.sheet.name,
    };
  }

  async getCategories(userId: string): Promise<string[]> {
    const rows = await this.prisma.books.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });

    return rows.map((row) => row.category).filter((c) => c && c.trim() !== '');
  }

  private toEntity(row: {
    id: number;
    userId: string;
    sheetId: number;
    title: string;
    author: string;
    category: string;
    image: string;
    impression: string;
    memo: string;
    isPublicMemo: boolean;
    isPurchasable: boolean;
    finished: Date | null;
    created: Date;
    updated: Date;
  }): Book {
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
      row.isPublicMemo,
      row.isPurchasable,
      row.finished ?? null,
      row.created ?? new Date(),
      row.updated ?? new Date(),
    );
  }
}
