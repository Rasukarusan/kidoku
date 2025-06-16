import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { sheets } from '../../database/schema/sheets.schema';
import { DrizzleDb } from '../../database/types';
import { INJECTION_TOKENS } from '../../constants/injection-tokens';
import { Sheet } from '../../modules/sheets/models/sheet.model';

@Injectable()
export class SheetsRepository {
  constructor(
    @Inject(INJECTION_TOKENS.DRIZZLE) private readonly db: DrizzleDb,
  ) {}
  async findByUserId(userId: string): Promise<Sheet[]> {
    return this.db
      .select()
      .from(sheets)
      .where(eq(sheets.userId, userId))
      .orderBy(desc(sheets.order));
  }

  async findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<Sheet | undefined> {
    const results = await this.db
      .select()
      .from(sheets)
      .where(and(eq(sheets.userId, userId), eq(sheets.name, name)))
      .limit(1);
    return results[0];
  }

  async findLastByUserId(userId: string): Promise<Sheet | undefined> {
    const results = await this.db
      .select()
      .from(sheets)
      .where(eq(sheets.userId, userId))
      .orderBy(desc(sheets.order))
      .limit(1);
    return results[0];
  }

  async create(data: {
    userId: string;
    name: string;
    order: number;
  }): Promise<Sheet> {
    const result = await this.db.insert(sheets).values(data);
    const insertId = result[0].insertId;
    const created = await this.db
      .select()
      .from(sheets)
      .where(eq(sheets.id, insertId))
      .limit(1);
    return created[0];
  }

  async update(
    userId: string,
    oldName: string,
    newName: string,
  ): Promise<Sheet> {
    await this.db
      .update(sheets)
      .set({ name: newName, updated: new Date() })
      .where(and(eq(sheets.userId, userId), eq(sheets.name, oldName)));
    const updated = await this.findByUserIdAndName(userId, newName);
    if (!updated) {
      throw new Error('Sheet not found after update');
    }
    return updated;
  }

  async delete(userId: string, name: string): Promise<void> {
    await this.db
      .delete(sheets)
      .where(and(eq(sheets.userId, userId), eq(sheets.name, name)));
  }

  async updateOrders(
    sheetUpdates: Array<{ id: string; order: number }>,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      for (const update of sheetUpdates) {
        await tx
          .update(sheets)
          .set({ order: update.order, updated: new Date() })
          .where(eq(sheets.id, parseInt(update.id)));
      }
    });
  }
}
