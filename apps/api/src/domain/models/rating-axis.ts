export class RatingAxis {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _order: number,
    private readonly _created: Date,
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

  static readonly MAX_NAME_LENGTH = 60;
  static readonly MIN_VALUE = 1;
  static readonly MAX_VALUE = 5;

  /** 評価値(1〜5)のバリデーション */
  static validateValue(value: number): void {
    if (
      !Number.isInteger(value) ||
      value < RatingAxis.MIN_VALUE ||
      value > RatingAxis.MAX_VALUE
    ) {
      throw new Error(
        `評価は${RatingAxis.MIN_VALUE}〜${RatingAxis.MAX_VALUE}の整数で指定してください`,
      );
    }
  }

  static create(params: {
    userId: string;
    name: string;
    order?: number;
  }): RatingAxis {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    const name = params.name?.trim();
    if (!name) {
      throw new Error('評価軸の名前は必須です');
    }
    if (name.length > RatingAxis.MAX_NAME_LENGTH) {
      throw new Error(
        `評価軸の名前は${RatingAxis.MAX_NAME_LENGTH}文字以内で入力してください`,
      );
    }
    return new RatingAxis(
      null,
      params.userId,
      name,
      params.order ?? 1,
      new Date(),
    );
  }

  static fromDatabase(
    id: string,
    userId: string,
    name: string,
    order: number,
    created: Date,
  ): RatingAxis {
    return new RatingAxis(id, userId, name, order, created);
  }
}
