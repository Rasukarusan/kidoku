import { Sheet } from '../models/sheet';

export abstract class ISheetRepository {
  abstract findByUserId(userId: string): Promise<Sheet[]>;
  abstract findById(id: string): Promise<Sheet | null>;
  abstract findLastByUserId(userId: string): Promise<Sheet | null>;
  abstract findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<Sheet | null>;
  abstract save(sheet: Sheet): Promise<Sheet>;
  abstract delete(id: string): Promise<void>;
  abstract saveAll(sheets: Sheet[]): Promise<void>;
}
