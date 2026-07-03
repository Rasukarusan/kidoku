export class ReReading {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _bookId: number,
    private readonly _finished: Date,
    private readonly _memo: string | null,
    private readonly _created: Date,
  ) {}

  get id(): string | null {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get bookId(): number {
    return this._bookId;
  }
  get finished(): Date {
    return this._finished;
  }
  get memo(): string | null {
    return this._memo;
  }
  get created(): Date {
    return this._created;
  }

  static create(params: {
    userId: string;
    bookId: number;
    finished: Date;
    memo: string | null;
  }): ReReading {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    if (!Number.isInteger(params.bookId) || params.bookId <= 0) {
      throw new Error('書籍IDが不正です');
    }
    if (!params.finished || isNaN(params.finished.getTime())) {
      throw new Error('読了日は必須です');
    }
    return new ReReading(
      null,
      params.userId,
      params.bookId,
      params.finished,
      params.memo,
      new Date(),
    );
  }

  static fromDatabase(
    id: string,
    userId: string,
    bookId: number,
    finished: Date,
    memo: string | null,
    created: Date,
  ): ReReading {
    return new ReReading(id, userId, bookId, finished, memo, created);
  }
}
