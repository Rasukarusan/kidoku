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
      const created = await this.prisma.itemTemplate.create({
        data: {
          userId: templateBook.userId,
          name: templateBook.name,
          title: templateBook.title,
          itemTypeId: 'book',
          attributes: {
            authors: templateBook.author ? [templateBook.author] : [],
          },
          category: templateBook.category,
          imageUrl: templateBook.image,
          memo: templateBook.memo,
          isPublicMemo: templateBook.isPublicMemo,
        },
      });

      return TemplateBook.fromDatabase(
        created.id.toString(),
        templateBook.userId,
        templateBook.name,
        templateBook.title,
        templateBook.author,
        templateBook.category,
        created.imageUrl,
        templateBook.memo,
        templateBook.isPublicMemo,
        created.createdAt,
        created.updatedAt,
      );
    } else {
      const id = parseInt(templateBook.id, 10);
      await this.prisma.itemTemplate.update({
        where: { id },
        data: {
          name: templateBook.name,
          title: templateBook.title,
          itemTypeId: 'book',
          attributes: {
            authors: templateBook.author ? [templateBook.author] : [],
          },
          category: templateBook.category,
          imageUrl: templateBook.image,
          memo: templateBook.memo,
          isPublicMemo: templateBook.isPublicMemo,
        },
      });
      return templateBook;
    }
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.itemTemplate.delete({
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
    isPublicMemo: boolean;
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
      row.isPublicMemo,
      row.created,
      row.updated,
    );
  }
}
