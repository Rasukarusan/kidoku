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
    const rows = await this.prisma.yearlyTopBook.findMany({
      where: { userId, year },
      select: {
        year: true,
        order: true,
        book: {
          select: { id: true, title: true, author: true, image: true },
        },
      },
      orderBy: { order: 'asc' },
    });

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
    await this.prisma.yearlyTopBook.upsert({
      create: {
        year,
        order,
        user: { connect: { id: userId } },
        book: { connect: { id: bookId } },
      },
      update: { book: { connect: { id: bookId } } },
      where: {
        userId_order_year: {
          year,
          order,
          userId,
        },
      },
    });
  }

  async delete(userId: string, year: string, order: number): Promise<void> {
    await this.prisma.yearlyTopBook.delete({
      where: {
        userId_order_year: {
          year,
          order,
          userId,
        },
      },
    });
  }
}
