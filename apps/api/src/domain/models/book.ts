export class Book {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private _sheetId: number,
    private _title: string,
    private _author: string,
    private _category: string,
    private _image: string,
    private _impression: string,
    private _memo: string,
    private _isPublicMemo: boolean,
    private _isPurchasable: boolean,
    private _price: string | null,
    private _media: string | null,
    private _finished: Date | null,
    private readonly _created: Date,
    private _updated: Date,
  ) {}

  get id(): string | null {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get sheetId(): number {
    return this._sheetId;
  }
  get title(): string {
    return this._title;
  }
  get author(): string {
    return this._author;
  }
  get category(): string {
    return this._category;
  }
  get image(): string {
    return this._image;
  }
  get impression(): string {
    return this._impression;
  }
  get memo(): string {
    return this._memo;
  }
  get isPublicMemo(): boolean {
    return this._isPublicMemo;
  }
  get isPurchasable(): boolean {
    return this._isPurchasable;
  }
  /** 購入価格（MIST単位の文字列）。null の場合はグローバル既定額を用いる */
  get price(): string | null {
    return this._price;
  }
  /** 媒体（paper/ebook/audiobook/library/other）。null は未設定 */
  get media(): string | null {
    return this._media;
  }
  get finished(): Date | null {
    return this._finished;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  update(params: {
    title?: string;
    author?: string;
    category?: string;
    image?: string;
    impression?: string;
    memo?: string;
    isPublicMemo?: boolean;
    isPurchasable?: boolean;
    price?: string | null;
    media?: string | null;
    finished?: Date | null;
    sheetId?: number;
  }): void {
    if (params.title !== undefined) {
      if (params.title.trim().length === 0) {
        throw new Error('書籍タイトルは必須です');
      }
      if (params.title.trim().length > Book.MAX_TITLE_LENGTH) {
        throw new Error(
          `タイトルは${Book.MAX_TITLE_LENGTH}文字以下で入力してください`,
        );
      }
      this._title = params.title;
    }
    if (params.author !== undefined) this._author = params.author;
    if (params.category !== undefined) this._category = params.category;
    if (params.image !== undefined) this._image = params.image;
    if (params.impression !== undefined) this._impression = params.impression;
    if (params.memo !== undefined) this._memo = params.memo;
    if (params.isPublicMemo !== undefined)
      this._isPublicMemo = params.isPublicMemo;
    if (params.isPurchasable !== undefined)
      this._isPurchasable = params.isPurchasable;
    if (params.price !== undefined)
      this._price = Book.normalizePrice(params.price);
    if (params.media !== undefined)
      this._media = Book.normalizeMedia(params.media);
    if (params.finished !== undefined) this._finished = params.finished;
    if (params.sheetId !== undefined) this._sheetId = params.sheetId;
    this._updated = new Date();
  }

  updateImage(imageUrl: string): void {
    this._image = imageUrl;
    this._updated = new Date();
  }

  /**
   * メモのマスキング処理（非所有者が公開メモを見る場合）
   * @param isOwner ユーザーが所有者かどうか
   * @returns マスキングされたメモ
   */
  getSanitizedMemo(isOwner: boolean): string | null {
    if (isOwner) {
      return this._memo;
    }
    if (!this._isPublicMemo) {
      return null;
    }
    // 公開メモの場合、マスキングを適用
    return this.maskMemo(this._memo);
  }

  private maskMemo(text: string): string {
    if (!text) return '';
    const maskChar = '●';
    const visibleRatio = 0.5;
    const visibleLength = Math.floor(text.length * visibleRatio);
    const maskedLength = text.length - visibleLength;
    return text.slice(0, visibleLength) + maskChar.repeat(maskedLength);
  }

  private static readonly MAX_TITLE_LENGTH = 100;

  /** 許可される媒体の値 */
  static readonly MEDIA_VALUES = [
    'paper',
    'ebook',
    'audiobook',
    'library',
    'other',
  ] as const;

  /**
   * 媒体を正規化する。null/空文字は「未設定」として null を返す。
   * 許可された値以外はエラー。
   */
  private static normalizeMedia(
    media: string | null | undefined,
  ): string | null {
    if (media === null || media === undefined || media === '') {
      return null;
    }
    if (!(Book.MEDIA_VALUES as readonly string[]).includes(media)) {
      throw new Error('媒体の指定が不正です');
    }
    return media;
  }

  /**
   * 価格（MIST単位）を正規化する。
   * null/空文字は「未設定（既定額を使用）」として null を返す。
   * 非負整数の文字列でなければエラー。
   */
  private static normalizePrice(
    price: string | null | undefined,
  ): string | null {
    if (price === null || price === undefined || price === '') {
      return null;
    }
    const trimmed = String(price).trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new Error('価格はMIST単位の非負整数で指定してください');
    }
    // 先頭ゼロを正規化（"007" -> "7", "0" -> "0"）
    const normalized = BigInt(trimmed).toString();
    if (BigInt(normalized) <= 0n) {
      throw new Error('価格は0より大きい値を指定してください');
    }
    return normalized;
  }

  static create(params: {
    userId: string;
    sheetId: number;
    title: string;
    author: string;
    category: string;
    image: string;
    impression: string;
    memo: string;
    isPublicMemo: boolean;
    isPurchasable?: boolean;
    price?: string | null;
    media?: string | null;
    finished: Date | null;
  }): Book {
    if (!params.title || params.title.trim().length === 0) {
      throw new Error('書籍タイトルは必須です');
    }
    if (params.title.trim().length > Book.MAX_TITLE_LENGTH) {
      throw new Error(
        `タイトルは${Book.MAX_TITLE_LENGTH}文字以下で入力してください`,
      );
    }
    const now = new Date();
    return new Book(
      null,
      params.userId,
      params.sheetId,
      params.title.trim(),
      params.author?.trim() || '',
      params.category?.trim() || '',
      params.image || '',
      params.impression || '',
      params.memo || '',
      params.isPublicMemo,
      params.isPurchasable ?? false,
      Book.normalizePrice(params.price),
      Book.normalizeMedia(params.media),
      params.finished,
      now,
      now,
    );
  }

  static fromDatabase(
    id: string,
    userId: string,
    sheetId: number,
    title: string,
    author: string,
    category: string,
    image: string,
    impression: string,
    memo: string,
    isPublicMemo: boolean,
    isPurchasable: boolean,
    finished: Date | null,
    created: Date,
    updated: Date,
    price: string | null = null,
    media: string | null = null,
  ): Book {
    return new Book(
      id,
      userId,
      sheetId,
      title,
      author,
      category,
      image,
      impression,
      memo,
      isPublicMemo,
      isPurchasable,
      price,
      media,
      finished,
      created,
      updated,
    );
  }
}
