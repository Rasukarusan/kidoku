import { Inject, Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
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
}
