import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { sheets } from '../database/schema/sheets.schema';
import { DrizzleDb } from '../database/types';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { Sheet } from '../../domain/models/sheet';
import { ISheetRepository } from '../../domain/repositories/sheet';

@Injectable()
export class SheetRepository implements ISheetRepository {
  constructor(
    @Inject(INJECTION_TOKENS.DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async findByUserId(userId: string): Promise<Sheet[]> {
    const rows = await this.db
      .select()
      .from(sheets)
      .where(eq(sheets.userId, userId))
      .orderBy(desc(sheets.order));
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
    const rows = await this.db
      .select()
      .from(sheets)
      .where(eq(sheets.id, parseInt(id)))
      .limit(1);
    if (rows.length === 0) return null;
    return Sheet.fromDatabase(
      rows[0].id.toString(),
      rows[0].userId,
      rows[0].name,
      rows[0].order ?? 0,
      rows[0].created ?? new Date(),
      rows[0].updated ?? new Date(),
    );
  }

  async findLastByUserId(userId: string): Promise<Sheet | null> {
    const rows = await this.db
      .select()
      .from(sheets)
      .where(eq(sheets.userId, userId))
      .orderBy(desc(sheets.order))
      .limit(1);
    if (rows.length === 0) return null;
    return Sheet.fromDatabase(
      rows[0].id.toString(),
      rows[0].userId,
      rows[0].name,
      rows[0].order ?? 0,
      rows[0].created ?? new Date(),
      rows[0].updated ?? new Date(),
    );
  }

  async findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<Sheet | null> {
    const rows = await this.db
      .select()
      .from(sheets)
      .where(and(eq(sheets.userId, userId), eq(sheets.name, name)))
      .limit(1);
    if (rows.length === 0) return null;
    return Sheet.fromDatabase(
      rows[0].id.toString(),
      rows[0].userId,
      rows[0].name,
      rows[0].order ?? 0,
      rows[0].created ?? new Date(),
      rows[0].updated ?? new Date(),
    );
  }

  async save(sheet: Sheet): Promise<Sheet> {
    if (sheet.id === null) {
      const result = (await this.db.insert(sheets).values({
        userId: sheet.userId,
        name: sheet.name,
        order: sheet.order,
        created: sheet.created,
        updated: sheet.updated,
      })) as any[];

      const insertId = result[0].insertId as number;
      return Sheet.fromDatabase(
        insertId.toString(),
        sheet.userId,
        sheet.name,
        sheet.order,
        sheet.created,
        sheet.updated,
      );
    } else {
      await this.db
        .update(sheets)
        .set({
          name: sheet.name,
          order: sheet.order,
          updated: sheet.updated,
        })
        .where(eq(sheets.id, parseInt(sheet.id)));

      return sheet;
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(sheets).where(eq(sheets.id, parseInt(id)));
  }

  async saveAll(sheetList: Sheet[]): Promise<void> {
    for (const sheet of sheetList) {
      await this.save(sheet);
    }
  }
}
