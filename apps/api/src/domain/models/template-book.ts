export class TemplateBook {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _title: string,
    private readonly _author: string,
    private readonly _category: string,
    private _image: string,
    private readonly _memo: string,
    private readonly _isPublicMemo: boolean,
    private readonly _created: Date,
    private readonly _updated: Date,
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
  get memo(): string {
    return this._memo;
  }
  get isPublicMemo(): boolean {
    return this._isPublicMemo;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  static create(params: {
    userId: string;
    name: string;
    title: string;
    author: string;
    category: string;
    image: string;
    memo: string;
    isPublicMemo: boolean;
  }): TemplateBook {
    const now = new Date();
    return new TemplateBook(
      null,
      params.userId,
      params.name,
      params.title,
      params.author,
      params.category,
      params.image,
      params.memo,
      params.isPublicMemo,
      now,
      now,
    );
  }

  static fromDatabase(
    id: string,
    userId: string,
    name: string,
    title: string,
    author: string,
    category: string,
    image: string,
    memo: string,
    isPublicMemo: boolean,
    created: Date,
    updated: Date,
  ): TemplateBook {
    return new TemplateBook(
      id,
      userId,
      name,
      title,
      author,
      category,
      image,
      memo,
      isPublicMemo,
      created,
      updated,
    );
  }
}
