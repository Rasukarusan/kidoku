import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Quote } from '../../domain/models/quote';
import { QuoteWithBook } from '../../domain/types/quote';
import { IQuoteRepository } from '../../domain/repositories/quote';

@Injectable()
export class QuoteRepository implements IQuoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBookId(bookId: number, userId: string): Promise<Quote[]> {
    const rows = await this.prisma.quote.findMany({
      where: { bookId, userId },
      orderBy: [{ page: 'asc' }, { created: 'asc' }],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findWithBookByUserId(userId: string): Promise<QuoteWithBook[]> {
    const rows = await this.prisma.quote.findMany({
      where: { userId },
      include: {
        book: { select: { title: true, author: true, image: true } },
      },
      orderBy: { created: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      bookId: row.bookId,
      page: row.page,
      text: row.text,
      comment: row.comment,
      created: row.created,
      bookTitle: row.book.title,
      bookAuthor: row.book.author,
      bookImage: row.book.image,
    }));
  }

  async findById(id: number, userId: string): Promise<Quote | null> {
    const row = await this.prisma.quote.findFirst({
      where: { id, userId },
    });
    return row ? this.toEntity(row) : null;
  }

  async save(quote: Quote): Promise<Quote> {
    if (quote.id === null) {
      const created = await this.prisma.quote.create({
        data: {
          userId: quote.userId,
          bookId: quote.bookId,
          page: quote.page,
          text: quote.text,
          comment: quote.comment,
        },
      });
      return this.toEntity(created);
    }

    const id = parseInt(quote.id, 10);
    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        page: quote.page,
        text: quote.text,
        comment: quote.comment,
        updated: quote.updated,
      },
    });
    return this.toEntity(updated);
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.quote.delete({
      where: { id, userId },
    });
  }

  private toEntity(row: {
    id: number;
    userId: string;
    bookId: number;
    page: number | null;
    text: string;
    comment: string | null;
    created: Date;
    updated: Date;
  }): Quote {
    return Quote.fromDatabase(
      row.id.toString(),
      row.userId,
      row.bookId,
      row.page,
      row.text,
      row.comment,
      row.created,
      row.updated,
    );
  }
}
