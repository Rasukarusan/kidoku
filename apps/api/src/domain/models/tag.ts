export class Tag {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _name: string,
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
  get created(): Date {
    return this._created;
  }

  static readonly MAX_NAME_LENGTH = 60;

  /** タグ名を正規化する（前後空白除去） */
  static normalizeName(name: string): string {
    return name.trim();
  }

  static create(params: { userId: string; name: string }): Tag {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    const name = Tag.normalizeName(params.name);
    if (!name) {
      throw new Error('タグ名は必須です');
    }
    if (name.length > Tag.MAX_NAME_LENGTH) {
      throw new Error(
        `タグ名は${Tag.MAX_NAME_LENGTH}文字以内で入力してください`,
      );
    }
    return new Tag(null, params.userId, name, new Date());
  }

  static fromDatabase(
    id: string,
    userId: string,
    name: string,
    created: Date,
  ): Tag {
    return new Tag(id, userId, name, created);
  }
}
