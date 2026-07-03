import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ITagRepository } from '../../domain/repositories/tag';
import { TagWithCount, TaggedBook } from '../../domain/types/tag';
import { Tag } from '../../domain/models/tag';

@Injectable()
export class TagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdWithCount(userId: string): Promise<TagWithCount[]> {
    const rows = await this.prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { bookTags: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      bookCount: row._count.bookTags,
    }));
  }

  async findNamesByBookId(bookId: number, userId: string): Promise<string[]> {
    const rows = await this.prisma.bookTag.findMany({
      where: { bookId, tag: { userId } },
      include: { tag: { select: { name: true } } },
      orderBy: { created: 'asc' },
    });
    return rows.map((row) => row.tag.name);
  }

  async findBooksByTagName(
    userId: string,
    tagName: string,
  ): Promise<TaggedBook[]> {
    const rows = await this.prisma.bookTag.findMany({
      where: { tag: { userId, name: tagName } },
      include: {
        book: {
          include: { sheet: { select: { name: true } } },
        },
      },
      orderBy: { created: 'desc' },
    });
    return rows.map((row) => ({
      id: row.book.id,
      title: row.book.title,
      author: row.book.author,
      category: row.book.category,
      image: row.book.image,
      impression: row.book.impression,
      sheetName: row.book.sheet.name,
      finished: row.book.finished,
    }));
  }

  async replaceBookTags(
    bookId: number,
    userId: string,
    tagNames: string[],
  ): Promise<string[]> {
    // ドメインモデルでバリデーション・正規化し、重複を除く
    const normalized = Array.from(
      new Set(tagNames.map((name) => Tag.create({ userId, name }).name)),
    );

    await this.prisma.$transaction(async (tx) => {
      // 既存タグを取得し、足りないものを作成
      const tagIds: number[] = [];
      for (const name of normalized) {
        const tag = await tx.tag.upsert({
          where: { userId_name: { userId, name } },
          create: { userId, name },
          update: {},
        });
        tagIds.push(tag.id);
      }

      // 本の既存タグリンクを置き換え
      await tx.bookTag.deleteMany({
        where: { bookId, tag: { userId } },
      });
      if (tagIds.length > 0) {
        await tx.bookTag.createMany({
          data: tagIds.map((tagId) => ({ bookId, tagId })),
        });
      }

      // どの本にも付かなくなったタグを削除
      await tx.tag.deleteMany({
        where: { userId, bookTags: { none: {} } },
      });
    });

    return normalized;
  }
}
