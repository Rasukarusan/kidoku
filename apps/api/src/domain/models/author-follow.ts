export class AuthorFollow {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _authorName: string,
    private readonly _created: Date,
  ) {}

  get id(): string | null {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get authorName(): string {
    return this._authorName;
  }
  get created(): Date {
    return this._created;
  }

  static readonly MAX_NAME_LENGTH = 120;

  static create(params: { userId: string; authorName: string }): AuthorFollow {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    const name = params.authorName?.trim();
    if (!name || name === '-') {
      throw new Error('著者名は必須です');
    }
    if (name.length > AuthorFollow.MAX_NAME_LENGTH) {
      throw new Error(
        `著者名は${AuthorFollow.MAX_NAME_LENGTH}文字以内で入力してください`,
      );
    }
    return new AuthorFollow(null, params.userId, name, new Date());
  }

  static fromDatabase(
    id: string,
    userId: string,
    authorName: string,
    created: Date,
  ): AuthorFollow {
    return new AuthorFollow(id, userId, authorName, created);
  }
}
