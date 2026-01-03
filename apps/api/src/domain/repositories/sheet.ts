import { Sheet } from 'src/domain/models/sheet';

export abstract class ISheetRepository {
  abstract findByUserId(userId: string): Promise<Sheet[]>;
  abstract findById(id: string): Promise<Sheet | null>;
  abstract save(sheet: Sheet): Promise<Sheet>;
  abstract delete(sheet: Sheet): Promise<void>;
}
