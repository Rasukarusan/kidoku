import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IAiSummaryRepository } from '../../domain/repositories/ai-summary';

@Injectable()
export class AiSummaryRepository implements IAiSummaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countByUserIdAndMonth(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const rows = await this.prisma.aiSummaries.findMany({
      where: {
        userId,
        created: {
          gte: start,
          lt: end,
        },
      },
      select: { id: true },
    });
    return rows.length;
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
