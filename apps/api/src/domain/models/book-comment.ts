export class BookComment {
  static readonly MAX_CONTENT_LENGTH = 1000;

  private constructor(
    private readonly _id: number | null,
    private readonly _bookId: number,
    private readonly _userId: string,
    private _content: string,
    private readonly _created: Date,
    private _updated: Date,
    private readonly _username: string,
    private readonly _userImage: string | null,
  ) {}

  get id(): number | null {
    return this._id;
  }
  get bookId(): number {
    return this._bookId;
  }
  get userId(): string {
    return this._userId;
  }
  get content(): string {
    return this._content;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }
  get username(): string {
    return this._username;
  }
  get userImage(): string | null {
    return this._userImage;
  }

  private static validateContent(content: string): string {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new Error('コメントを入力してください');
    }
    if (trimmed.length > BookComment.MAX_CONTENT_LENGTH) {
      throw new Error(
        `コメントは${BookComment.MAX_CONTENT_LENGTH}文字以内で入力してください`,
      );
    }
    return trimmed;
  }

  static create(params: {
    bookId: number;
    userId: string;
    content: string;
  }): BookComment {
    if (!params.bookId || params.bookId <= 0) {
      throw new Error('書籍IDが不正です');
    }
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    const content = BookComment.validateContent(params.content);
    const now = new Date();
    return new BookComment(
      null,
      params.bookId,
      params.userId,
      content,
      now,
      now,
      '',
      null,
    );
  }

  static fromDatabase(
    id: number,
    bookId: number,
    userId: string,
    content: string,
    created: Date,
    updated: Date,
    username: string,
    userImage: string | null,
  ): BookComment {
    return new BookComment(
      id,
      bookId,
      userId,
      content,
      created,
      updated,
      username,
      userImage,
    );
  }
}
