import { readSheets } from '@kidoku/reading-store';
import { CollectionRepository } from './collection';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Sheet } from '../../domain/models/sheet';
import { ISheetRepository } from '../../domain/repositories/sheet';

@Injectable()
export class SheetRepository implements ISheetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Sheet[]> {
    const rows = await readSheets(this.prisma, {
      where: { userId },
      orderBy: { position: 'desc' },
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

    const row = await readSheets(this.prisma, {
      where: { id: sheetId },
      limit: 1,
    }).then((rows) => rows[0] ?? null);
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
    const row = await readSheets(this.prisma, {
      where: { userId },
      orderBy: { position: 'desc' },
      limit: 1,
    }).then((rows) => rows[0] ?? null);
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
    const row = await readSheets(this.prisma, {
      where: { userId, name },
      limit: 1,
    }).then((rows) => rows[0] ?? null);
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
      const created = await this.prisma.collection.create({
        data: {
          userId: sheet.userId,
          name: sheet.name,
          description: '',
          position: sheet.order,
          createdAt: sheet.created,
          updatedAt: sheet.updated,
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

      await this.prisma.collection.update({
        where: { id: sheetId },
        data: {
          name: sheet.name,
          position: sheet.order,
          updatedAt: sheet.updated,
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

    const collection = await this.prisma.collection.findUniqueOrThrow({
      where: { id: sheetId },
    });
    await new CollectionRepository(this.prisma).deleteCollection(
      collection.userId,
      sheetId,
    );
  }

  async saveAll(sheetList: Sheet[]): Promise<void> {
    for (const sheet of sheetList) {
      await this.save(sheet);
    }
  }
}
