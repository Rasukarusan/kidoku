import { Sheet } from 'src/domain/models/sheet';

export interface ISheetRepository {
  findByUserId(userId: string): Promise<Sheet[]>;
  findById(id: string): Promise<Sheet | null>;
  save(sheet: Sheet): Promise<Sheet>;
  delete(sheet: Sheet): Promise<void>;
}
