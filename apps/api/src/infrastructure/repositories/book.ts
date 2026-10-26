import { CollectionRepository } from './collection';
import { Prisma } from '@prisma/client';
import { Attributes } from '../../domain/models/item';
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

    if (row) return this.toEntity(row);
    // An unassigned book still has stable purchase/comment references.
    const item = await this.prisma.item.findFirst({
      where: { id: bookId, itemTypeId: 'book' },
      include: {
        collections: { orderBy: { collectionId: 'asc' } },
        logs: {
          where: { kind: 'read' },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
        },
      },
    });
    if (!item) return null;
    const authors = (item.attributes as Attributes).authors;
    return Book.fromDatabase(
      String(item.id),
      item.userId,
      item.collections[0]?.collectionId ?? 0,
      item.title,
      Array.isArray(authors) ? authors.join('、') : '',
      item.category,
      item.imageUrl,
      item.rating,
      item.memo,
      item.isPublicMemo,
      item.isPurchasable,
      item.logs[0]?.occurredAt ?? null,
      item.createdAt,
      item.updatedAt,
      item.price,
    );
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
    const members = await this.prisma.item.findMany({
      where: {
        userId,
        itemTypeId: 'book',
        collections: { some: { collectionId: sheetId } },
      },
      select: { id: true },
    });
    const rows = await this.prisma.books.findMany({
      where: { id: { in: members.map((item) => item.id) }, userId },
    });
    return rows.map((row) => this.toEntity({ ...row, sheetId }));
  }

  async findByUserIdAndSheetName(
    userId: string,
    sheetName: string,
  ): Promise<Book[]> {
    const collection = await this.prisma.collection.findFirst({
      where: { userId, name: sheetName },
    });
    return collection ? this.findByUserIdAndSheetId(userId, collection.id) : [];
  }

  async save(book: Book): Promise<Book> {
    return this.prisma.$transaction(
      async (tx) => {
        const id = book.id === null ? undefined : Number(book.id);
        const existing = id
          ? await tx.item.findFirst({
              where: { id, userId: book.userId, itemTypeId: 'book' },
              include: { collections: { orderBy: { collectionId: 'asc' } } },
            })
          : null;
        if (id && !existing) throw new Error('書籍が見つかりません');
        if (book.sheetId > 0) {
          const collection = await tx.collection.findFirst({
            where: { id: book.sheetId, userId: book.userId },
          });
          if (!collection) throw new Error('コレクションが見つかりません');
        } else if (!existing || existing.collections.length)
          throw new Error('コレクションが見つかりません');
        const previousAuthors = (existing?.attributes as Attributes | undefined)
          ?.authors;
        const keepAuthors =
          Array.isArray(previousAuthors) &&
          (book.author === previousAuthors[0] ||
            book.author === previousAuthors.join('、'));
        const data = {
          title: book.title,
          imageUrl: book.image,
          category: book.category,
          rating: book.impression,
          memo: book.memo,
          isPublicMemo: book.isPublicMemo,
          isPurchasable: book.isPurchasable,
          price: book.price,
          attributes: {
            ...((existing?.attributes as Attributes) ?? {}),
            authors: keepAuthors
              ? previousAuthors
              : book.author
                ? [book.author]
                : [],
          },
        };
        const saved = id
          ? await tx.item.update({
              where: { id, userId: book.userId, itemTypeId: 'book' },
              data,
            })
          : await tx.item.create({
              data: {
                ...data,
                userId: book.userId,
                itemTypeId: 'book',
                createdAt: book.created,
                updatedAt: book.updated,
              },
            });
        const oldPrimary = existing?.collections[0]?.collectionId;
        if (
          oldPrimary &&
          oldPrimary !== book.sheetId &&
          !existing?.collections.some(
            (link) => link.collectionId === book.sheetId,
          )
        ) {
          await tx.collectionItem.deleteMany({
            where: { itemId: saved.id, collectionId: oldPrimary },
          });
          await tx.collectionHighlight.deleteMany({
            where: { itemId: saved.id, collectionId: oldPrimary },
          });
        }
        if (book.sheetId > 0)
          await tx.collectionItem.upsert({
            where: {
              collectionId_itemId: {
                collectionId: book.sheetId,
                itemId: saved.id,
              },
            },
            update: {},
            create: { collectionId: book.sheetId, itemId: saved.id },
          });
        const latest = await tx.itemLog.findFirst({
          where: { itemId: saved.id, kind: 'read' },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        if (latest)
          await tx.itemLog.update({
            where: { id: latest.id },
            data: { occurredAt: book.finished },
          });
        else if (book.finished)
          await tx.itemLog.create({
            data: {
              itemId: saved.id,
              kind: 'read',
              occurredAt: book.finished,
              memo: '',
            },
          });
        return Book.fromDatabase(
          saved.id.toString(),
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
          book.price,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const book = await this.prisma.item.findFirst({
      where: { id: Number(id), userId, itemTypeId: 'book' },
    });
    if (book)
      await new CollectionRepository(this.prisma).deleteItem(
        userId,
        Number(id),
      );
  }

  async findAllForSearch(): Promise<
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
  > {
    const rows = await this.prisma.books.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
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
      category: row.category,
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
    category: string;
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
        category: true,
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
      category: row.category,
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
    price: string | null;
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
      row.price ?? null,
    );
  }
}
