import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RatingAxis } from '../../domain/models/rating-axis';
import { BookAxisRating } from '../../domain/types/rating';
import { IRatingAxisRepository } from '../../domain/repositories/rating-axis';

@Injectable()
export class RatingAxisRepository implements IRatingAxisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<RatingAxis[]> {
    const rows = await this.prisma.ratingAxis.findMany({
      where: { userId },
      orderBy: [{ order: 'asc' }, { created: 'asc' }],
    });
    return rows.map((row) =>
      RatingAxis.fromDatabase(
        row.id.toString(),
        row.userId,
        row.name,
        row.order,
        row.created,
      ),
    );
  }

  async save(axis: RatingAxis): Promise<RatingAxis> {
    const created = await this.prisma.ratingAxis.create({
      data: {
        userId: axis.userId,
        name: axis.name,
        order: axis.order,
      },
    });
    return RatingAxis.fromDatabase(
      created.id.toString(),
      created.userId,
      created.name,
      created.order,
      created.created,
    );
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.ratingAxis.delete({
      where: { id, userId },
    });
  }

  async findRatingsByBookId(
    bookId: number,
    userId: string,
  ): Promise<BookAxisRating[]> {
    const rows = await this.prisma.bookRating.findMany({
      where: { bookId, axis: { userId } },
      include: { axis: { select: { name: true, order: true } } },
    });
    return rows
      .sort((a, b) => a.axis.order - b.axis.order)
      .map((row) => ({
        axisId: row.axisId,
        axisName: row.axis.name,
        value: row.value,
      }));
  }

  async setRating(
    bookId: number,
    axisId: number,
    userId: string,
    value: number | null,
  ): Promise<void> {
    const axis = await this.prisma.ratingAxis.findFirst({
      where: { id: axisId, userId },
    });
    if (!axis) {
      throw new NotFoundException('評価軸が見つかりません');
    }
    if (value === null) {
      await this.prisma.bookRating.deleteMany({
        where: { bookId, axisId },
      });
      return;
    }
    await this.prisma.bookRating.upsert({
      where: { bookId_axisId: { bookId, axisId } },
      create: { bookId, axisId, value },
      update: { value, updated: new Date() },
    });
  }
}
