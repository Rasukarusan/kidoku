export class Comment {
  private constructor(
    private readonly _bookId: string,
    private readonly _bookTitle: string,
    private readonly _bookMemo: string,
    private readonly _bookImage: string,
    private readonly _bookUpdated: Date,
    private readonly _username: string,
    private readonly _userImage: string | null,
    private readonly _sheetId: string,
  ) {}

  get bookId(): string {
    return this._bookId;
  }
  get bookTitle(): string {
    return this._bookTitle;
  }
  get bookMemo(): string {
    return this._bookMemo;
  }
  get bookImage(): string {
    return this._bookImage;
  }
  get bookUpdated(): Date {
    return this._bookUpdated;
  }
  get username(): string {
    return this._username;
  }
  get userImage(): string | null {
    return this._userImage;
  }
  get sheetId(): string {
    return this._sheetId;
  }

  static fromDatabase(
    bookId: string,
    bookTitle: string,
    bookMemo: string,
    bookImage: string,
    bookUpdated: Date,
    username: string,
    userImage: string | null,
    sheetId: string,
  ): Comment {
    return new Comment(
      bookId,
      bookTitle,
      bookMemo,
      bookImage,
      bookUpdated,
      username,
      userImage,
      sheetId,
    );
  }
}
