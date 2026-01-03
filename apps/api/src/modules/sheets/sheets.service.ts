import { Injectable } from '@nestjs/common';
import { SheetsRepository } from '../../infrastructure/repositories/sheets.repository';
import { SheetObject } from './dto/sheet.object';
import { UpdateSheetOrdersInput } from './dto/update-sheet-orders.input';

@Injectable()
export class SheetsService {
  constructor(private readonly sheetsRepository: SheetsRepository) {}

  // async createSheet(userId: string, name: string): Promise<SheetObject> {
  //   const lastSheet = await this.sheetsRepository.findLastByUserId(userId);
  //   const order = lastSheet ? (lastSheet.order ?? 0) + 1 : 1;

  //   const created = await this.sheetsRepository.create({
  //     userId,
  //     name,
  //     order,
  //   });

  //   return {
  //     id: created.id.toString(),
  //     name: created.name,
  //     userId: created.userId,
  //     created: created.created ?? undefined,
  //     updated: created.updated ?? undefined,
  //     order: created.order ?? undefined,
  //   };
  // }

  // async updateSheet(
  //   userId: string,
  //   oldName: string,
  //   newName: string,
  // ): Promise<SheetObject> {
  //   const updated = await this.sheetsRepository.update(
  //     userId,
  //     oldName,
  //     newName,
  //   );

  //   return {
  //     id: updated.id.toString(),
  //     name: updated.name,
  //     userId: updated.userId,
  //     created: updated.created ?? undefined,
  //     updated: updated.updated ?? undefined,
  //     order: updated.order ?? undefined,
  //   };
  // }

  // async deleteSheet(userId: string, name: string): Promise<void> {
  //   await this.sheetsRepository.delete(userId, name);
  // }

  // async updateSheetOrders(
  //   userId: string,
  //   input: UpdateSheetOrdersInput,
  // ): Promise<boolean> {
  //   const sheetUpdates = input.sheets.map((sheet) => ({
  //     id: sheet.id,
  //     order: sheet.order,
  //   }));

  //   await this.sheetsRepository.updateOrders(sheetUpdates);
  //   return true;
  // }
}
