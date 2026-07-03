export class Quote {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _bookId: number,
    private _page: number | null,
    private _text: string,
    private _comment: string | null,
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
  get page(): number | null {
    return this._page;
  }
  get text(): string {
    return this._text;
  }
  get comment(): string | null {
    return this._comment;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  private static validate(params: { text: string; page: number | null }): void {
    if (!params.text || params.text.trim() === '') {
      throw new Error('引用文は必須です');
    }
    if (params.text.length > 2000) {
      throw new Error('引用文は2000文字以内で入力してください');
    }
    if (
      params.page !== null &&
      (!Number.isInteger(params.page) || params.page <= 0)
    ) {
      throw new Error('ページ番号は正の整数で指定してください');
    }
  }

  static create(params: {
    userId: string;
    bookId: number;
    page: number | null;
    text: string;
    comment: string | null;
  }): Quote {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    if (!Number.isInteger(params.bookId) || params.bookId <= 0) {
      throw new Error('書籍IDが不正です');
    }
    this.validate(params);
    const now = new Date();
    return new Quote(
      null,
      params.userId,
      params.bookId,
      params.page,
      params.text,
      params.comment,
      now,
      now,
    );
  }

  update(params: {
    page: number | null;
    text: string;
    comment: string | null;
  }): void {
    Quote.validate(params);
    this._page = params.page;
    this._text = params.text;
    this._comment = params.comment;
    this._updated = new Date();
  }

  static fromDatabase(
    id: string,
    userId: string,
    bookId: number,
    page: number | null,
    text: string,
    comment: string | null,
    created: Date,
    updated: Date,
  ): Quote {
    return new Quote(id, userId, bookId, page, text, comment, created, updated);
  }
}
