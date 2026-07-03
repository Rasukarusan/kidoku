import { RatingAxis } from '../models/rating-axis';
import { BookAxisRating } from '../types/rating';

export abstract class IRatingAxisRepository {
  abstract findByUserId(userId: string): Promise<RatingAxis[]>;
  abstract save(axis: RatingAxis): Promise<RatingAxis>;
  abstract delete(id: number, userId: string): Promise<void>;
  /** 本ごとの評価値を軸名付きで返す */
  abstract findRatingsByBookId(
    bookId: number,
    userId: string,
  ): Promise<BookAxisRating[]>;
  /** 評価値を設定する。valueがnullの場合は削除する。軸の所有者チェック込み */
  abstract setRating(
    bookId: number,
    axisId: number,
    userId: string,
    value: number | null,
  ): Promise<void>;
}
