import { ReReading } from '../models/re-reading';

export abstract class IReReadingRepository {
  abstract findByBookId(bookId: number, userId: string): Promise<ReReading[]>;
  abstract findById(id: number, userId: string): Promise<ReReading | null>;
  abstract save(reReading: ReReading): Promise<ReReading>;
  abstract delete(id: number, userId: string): Promise<void>;
}
