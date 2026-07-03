import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReReading } from '../../domain/models/re-reading';
import { IReReadingRepository } from '../../domain/repositories/re-reading';

@Injectable()
export class ReReadingRepository implements IReReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBookId(bookId: number, userId: string): Promise<ReReading[]> {
    const rows = await this.prisma.reReading.findMany({
      where: { bookId, userId },
      orderBy: { finished: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: number, userId: string): Promise<ReReading | null> {
    const row = await this.prisma.reReading.findFirst({
      where: { id, userId },
    });
    return row ? this.toEntity(row) : null;
  }

  async save(reReading: ReReading): Promise<ReReading> {
    const created = await this.prisma.reReading.create({
      data: {
        userId: reReading.userId,
        bookId: reReading.bookId,
        finished: reReading.finished,
        memo: reReading.memo,
      },
    });
    return this.toEntity(created);
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.reReading.delete({
      where: { id, userId },
    });
  }

  private toEntity(row: {
    id: number;
    userId: string;
    bookId: number;
    finished: Date;
    memo: string | null;
    created: Date;
  }): ReReading {
    return ReReading.fromDatabase(
      row.id.toString(),
      row.userId,
      row.bookId,
      row.finished,
      row.memo,
      row.created,
    );
  }
}
