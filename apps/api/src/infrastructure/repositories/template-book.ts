import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TemplateBook } from '../../domain/models/template-book';
import { ITemplateBookRepository } from '../../domain/repositories/template-book';

@Injectable()
export class TemplateBookRepository implements ITemplateBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<TemplateBook[]> {
    const rows = await this.prisma.template_books.findMany({
      where: { userId },
      orderBy: { created: 'desc' },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async save(templateBook: TemplateBook): Promise<TemplateBook> {
    if (templateBook.id === null) {
      const created = await this.prisma.template_books.create({
        data: {
          userId: templateBook.userId,
          name: templateBook.name,
          title: templateBook.title,
          author: templateBook.author,
          category: templateBook.category,
          image: templateBook.image,
          memo: templateBook.memo,
          is_public_memo: templateBook.isPublicMemo,
        },
      });

      return TemplateBook.fromDatabase(
        created.id.toString(),
        templateBook.userId,
        templateBook.name,
        templateBook.title,
        templateBook.author,
        templateBook.category,
        created.image,
        templateBook.memo,
        templateBook.isPublicMemo,
        created.created,
        created.updated,
      );
    } else {
      const id = parseInt(templateBook.id, 10);
      await this.prisma.template_books.update({
        where: { id },
        data: {
          name: templateBook.name,
          title: templateBook.title,
          author: templateBook.author,
          category: templateBook.category,
          image: templateBook.image,
          memo: templateBook.memo,
          is_public_memo: templateBook.isPublicMemo,
        },
      });
      return templateBook;
    }
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.template_books.delete({
      where: { id, userId },
    });
  }

  private toEntity(row: {
    id: number;
    userId: string;
    name: string;
    title: string;
    author: string;
    category: string;
    image: string;
    memo: string;
    is_public_memo: boolean;
    created: Date;
    updated: Date;
  }): TemplateBook {
    return TemplateBook.fromDatabase(
      row.id.toString(),
      row.userId,
      row.name,
      row.title,
      row.author,
      row.category,
      row.image,
      row.memo,
      row.is_public_memo,
      row.created,
      row.updated,
    );
  }
}
