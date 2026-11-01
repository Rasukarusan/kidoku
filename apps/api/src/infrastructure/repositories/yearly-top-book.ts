import { readHighlights } from '@kidoku/reading-store';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  IYearlyTopBookRepository,
  YearlyTopBookWithBook,
} from '../../domain/repositories/yearly-top-book';

@Injectable()
export class YearlyTopBookRepository implements IYearlyTopBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndYear(
    userId: string,
    year: string,
  ): Promise<YearlyTopBookWithBook[]> {
    const rows = await readHighlights(this.prisma, { userId, year });

    return rows.map((row) => ({
      year: row.year,
      order: row.order,
      book: {
        id: row.book.id,
        title: row.book.title,
        author: row.book.author,
        image: row.book.image,
      },
    }));
  }

  async upsert(
    userId: string,
    year: string,
    order: number,
    bookId: number,
  ): Promise<void> {
    const collection = await this.prisma.collection.findFirstOrThrow({
      where: { userId, name: year },
    });
    const item = await this.prisma.item.findFirst({
      where: {
        id: bookId,
        userId,
        itemTypeId: 'book',
        collections: { some: { collectionId: collection.id } },
      },
    });
    if (!item) throw new Error('コレクション内の本が見つかりません');
    await this.prisma.collectionHighlight.upsert({
      where: {
        collectionId_position: { collectionId: collection.id, position: order },
      },
      create: { collectionId: collection.id, position: order, itemId: bookId },
      update: { itemId: bookId },
    });
  }

  async delete(userId: string, year: string, order: number): Promise<void> {
    const collection = await this.prisma.collection.findFirstOrThrow({
      where: { userId, name: year },
    });
    await this.prisma.collectionHighlight.deleteMany({
      where: { collectionId: collection.id, position: order },
    });
  }
}
