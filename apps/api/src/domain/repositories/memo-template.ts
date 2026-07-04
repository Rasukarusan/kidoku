import { MemoTemplate } from '../models/memo-template';

export abstract class IMemoTemplateRepository {
  abstract findByUserId(userId: string): Promise<MemoTemplate[]>;
  abstract findById(id: number, userId: string): Promise<MemoTemplate | null>;
  abstract save(memoTemplate: MemoTemplate): Promise<MemoTemplate>;
  abstract delete(id: number, userId: string): Promise<void>;
}
