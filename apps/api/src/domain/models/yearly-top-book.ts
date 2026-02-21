export class YearlyTopBook {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _bookId: number,
    private _order: number,
    private readonly _year: string,
    private readonly _created: Date,
    private _updated: Date,
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
  get order(): number {
    return this._order;
  }
  get year(): string {
    return this._year;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  static create(
    userId: string,
    year: string,
    order: number,
    bookId: number,
  ): YearlyTopBook {
    const now = new Date();
    return new YearlyTopBook(null, userId, bookId, order, year, now, now);
  }

  static fromDatabase(
    id: string,
    userId: string,
    bookId: number,
    order: number,
    year: string,
    created: Date,
    updated: Date,
  ): YearlyTopBook {
    return new YearlyTopBook(id, userId, bookId, order, year, created, updated);
  }
}
