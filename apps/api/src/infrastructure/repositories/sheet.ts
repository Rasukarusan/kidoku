import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Sheet } from '../../domain/models/sheet';
import { ISheetRepository } from '../../domain/repositories/sheet';

@Injectable()
export class SheetRepository implements ISheetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Sheet[]> {
    const rows = await this.prisma.sheets.findMany({
      where: { userId },
      orderBy: { order: 'desc' },
    });
    return rows.map((row) =>
      Sheet.fromDatabase(
        row.id.toString(),
        row.userId,
        row.name,
        row.order ?? 0,
        row.created ?? new Date(),
        row.updated ?? new Date(),
      ),
    );
  }

  async findById(id: string): Promise<Sheet | null> {
    const sheetId = parseInt(id, 10);
    if (isNaN(sheetId) || sheetId <= 0) {
      return null;
    }

    const row = await this.prisma.sheets.findUnique({
      where: { id: sheetId },
    });
    if (!row) return null;
    return Sheet.fromDatabase(
      row.id.toString(),
      row.userId,
      row.name,
      row.order ?? 0,
      row.created ?? new Date(),
      row.updated ?? new Date(),
    );
  }

  async findLastByUserId(userId: string): Promise<Sheet | null> {
    const row = await this.prisma.sheets.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
    });
    if (!row) return null;
    return Sheet.fromDatabase(
      row.id.toString(),
      row.userId,
      row.name,
      row.order ?? 0,
      row.created ?? new Date(),
      row.updated ?? new Date(),
    );
  }

  async findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<Sheet | null> {
    const row = await this.prisma.sheets.findFirst({
      where: { userId, name },
    });
    if (!row) return null;
    return Sheet.fromDatabase(
      row.id.toString(),
      row.userId,
      row.name,
      row.order ?? 0,
      row.created ?? new Date(),
      row.updated ?? new Date(),
    );
  }

  async save(sheet: Sheet): Promise<Sheet> {
    if (sheet.id === null) {
      const created = await this.prisma.sheets.create({
        data: {
          userId: sheet.userId,
          name: sheet.name,
          order: sheet.order,
          created: sheet.created,
          updated: sheet.updated,
        },
      });

      return Sheet.fromDatabase(
        created.id.toString(),
        sheet.userId,
        sheet.name,
        sheet.order,
        sheet.created,
        sheet.updated,
      );
    } else {
      const sheetId = parseInt(sheet.id, 10);
      if (isNaN(sheetId) || sheetId <= 0) {
        throw new Error('Invalid sheet ID');
      }

      await this.prisma.sheets.update({
        where: { id: sheetId },
        data: {
          name: sheet.name,
          order: sheet.order,
          updated: sheet.updated,
        },
      });

      return sheet;
    }
  }

  async delete(id: string): Promise<void> {
    const sheetId = parseInt(id, 10);
    if (isNaN(sheetId) || sheetId <= 0) {
      throw new Error('Invalid sheet ID');
    }

    await this.prisma.sheets.delete({
      where: { id: sheetId },
    });
  }

  async saveAll(sheetList: Sheet[]): Promise<void> {
    for (const sheet of sheetList) {
      await this.save(sheet);
    }
  }
}
