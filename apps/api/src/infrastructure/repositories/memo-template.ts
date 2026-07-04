import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MemoTemplate } from '../../domain/models/memo-template';
import { IMemoTemplateRepository } from '../../domain/repositories/memo-template';

@Injectable()
export class MemoTemplateRepository implements IMemoTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<MemoTemplate[]> {
    const rows = await this.prisma.memoTemplate.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { created: 'desc' }],
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number, userId: string): Promise<MemoTemplate | null> {
    const row = await this.prisma.memoTemplate.findFirst({
      where: { id, userId },
    });
    return row ? this.toEntity(row) : null;
  }

  async save(memoTemplate: MemoTemplate): Promise<MemoTemplate> {
    if (memoTemplate.id === null) {
      const created = await this.prisma.$transaction(async (tx) => {
        if (memoTemplate.isDefault) {
          await tx.memoTemplate.updateMany({
            where: { userId: memoTemplate.userId, isDefault: true },
            data: { isDefault: false },
          });
        }
        return tx.memoTemplate.create({
          data: {
            userId: memoTemplate.userId,
            name: memoTemplate.name,
            content: memoTemplate.content,
            isDefault: memoTemplate.isDefault,
          },
        });
      });
      return this.toEntity(created);
    }

    const id = parseInt(memoTemplate.id, 10);
    const updated = await this.prisma.$transaction(async (tx) => {
      if (memoTemplate.isDefault) {
        await tx.memoTemplate.updateMany({
          where: {
            userId: memoTemplate.userId,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }
      return tx.memoTemplate.update({
        where: { id },
        data: {
          name: memoTemplate.name,
          content: memoTemplate.content,
          isDefault: memoTemplate.isDefault,
          updated: memoTemplate.updated,
        },
      });
    });
    return this.toEntity(updated);
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.memoTemplate.delete({
      where: { id, userId },
    });
  }

  private toEntity(row: {
    id: number;
    userId: string;
    name: string;
    content: string;
    isDefault: boolean;
    created: Date;
    updated: Date;
  }): MemoTemplate {
    return MemoTemplate.fromDatabase(
      row.id.toString(),
      row.userId,
      row.name,
      row.content,
      row.isDefault,
      row.created,
      row.updated,
    );
  }
}
