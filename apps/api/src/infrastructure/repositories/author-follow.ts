import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthorFollow } from '../../domain/models/author-follow';
import { IAuthorFollowRepository } from '../../domain/repositories/author-follow';

@Injectable()
export class AuthorFollowRepository implements IAuthorFollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<AuthorFollow[]> {
    const rows = await this.prisma.authorFollow.findMany({
      where: { userId },
      orderBy: { created: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findByUserIdAndName(
    userId: string,
    authorName: string,
  ): Promise<AuthorFollow | null> {
    const row = await this.prisma.authorFollow.findFirst({
      where: { userId, authorName },
    });
    return row ? this.toEntity(row) : null;
  }

  async save(authorFollow: AuthorFollow): Promise<AuthorFollow> {
    const created = await this.prisma.authorFollow.create({
      data: {
        userId: authorFollow.userId,
        authorName: authorFollow.authorName,
      },
    });
    return this.toEntity(created);
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.authorFollow.delete({
      where: { id, userId },
    });
  }

  private toEntity(row: {
    id: number;
    userId: string;
    authorName: string;
    created: Date;
  }): AuthorFollow {
    return AuthorFollow.fromDatabase(
      row.id.toString(),
      row.userId,
      row.authorName,
      row.created,
    );
  }
}
