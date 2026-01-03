import { Sheet } from 'src/domain/models/sheet';

export abstract class ISheetRepository {
  abstract findByUserId(userId: string): Promise<Sheet[]>;
  abstract save(sheet: Sheet): Promise<Sheet>;
  abstract findLastByUserId(userId: string): Promise<Sheet | null>;
  abstract findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<Sheet | null>;
  // abstract delete(sheet: Sheet): Promise<void>;
}
