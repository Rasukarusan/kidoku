export class Sheet {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private _name: string,
    private _order: number,
    private readonly _created: Date,
    private _updated: Date,
  ) {}

  get id(): string | null {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get name(): string {
    return this._name;
  }
  get order(): number {
    return this._order;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  static create(userId: string, name: string, order: number): Sheet {
    if (!name || name.trim().length === 0) {
      throw new Error('シート名は必須です');
    }
    const now = new Date();
    return new Sheet(null, userId, name.trim(), order, now, now);
  }

  static fromDatabase(
    id: string,
    userId: string,
    name: string,
    order: number,
    created: Date,
    updated: Date,
  ): Sheet {
    return new Sheet(id, userId, name, order, created, updated);
  }
}
