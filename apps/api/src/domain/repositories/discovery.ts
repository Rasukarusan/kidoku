import { PopularBook, TopReader } from '../types/social';

export abstract class IDiscoveryRepository {
  /** 直近で最もいいねされている本（最近のいいねが無ければ累計で代替） */
  abstract weeklyPopularBooks(limit: number): Promise<PopularBook[]>;
  /** 読了数ランキング */
  abstract topReaders(limit: number): Promise<TopReader[]>;
}
