export abstract class IAiSummaryRepository {
  abstract countByUserIdAndMonth(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number>;

  abstract create(
    userId: string,
    sheetId: number,
    analysis: Record<string, unknown>,
    token: number,
  ): Promise<void>;

  abstract delete(id: number, userId: string): Promise<number>;
}
