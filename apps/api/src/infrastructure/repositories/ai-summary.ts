import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IAiSummaryRepository } from '../../domain/repositories/ai-summary';
import { AiSummary } from '../../domain/models/ai-summary';

@Injectable()
export class AiSummaryRepository implements IAiSummaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndSheetId(
    userId: string,
    sheetId: number,
  ): Promise<AiSummary[]> {
    const rows = await this.prisma.aiSummaries.findMany({
      where: { userId, sheetId },
      orderBy: { created: 'desc' },
    });
    return rows.map((row) =>
      AiSummary.fromDatabase(
        String(row.id),
        row.userId,
        row.sheetId,
        row.analysis as Record<string, unknown>,
        row.token,
        row.created ?? new Date(),
        row.updated ?? new Date(),
      ),
    );
  }

  async create(
    userId: string,
    sheetId: number,
    analysis: Record<string, unknown>,
    token: number,
  ): Promise<void> {
    await this.prisma.aiSummaries.create({
      data: {
        userId,
        sheetId: sheetId,
        analysis: analysis as Prisma.InputJsonValue,
        token,
      },
    });
  }

  async delete(id: number, userId: string): Promise<number> {
    const result = await this.prisma.aiSummaries.deleteMany({
      where: { id, userId },
    });
    return result.count;
  }
}
