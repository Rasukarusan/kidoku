export class MemoTemplate {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private _name: string,
    private _content: string,
    private _isDefault: boolean,
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
  get content(): string {
    return this._content;
  }
  get isDefault(): boolean {
    return this._isDefault;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  private static validate(params: { name: string; content: string }): void {
    if (!params.name || params.name.trim() === '') {
      throw new Error('テンプレート名は必須です');
    }
    if (params.name.length > 120) {
      throw new Error('テンプレート名は120文字以内で入力してください');
    }
    if (!params.content || params.content.trim() === '') {
      throw new Error('テンプレート内容は必須です');
    }
  }

  static create(params: {
    userId: string;
    name: string;
    content: string;
    isDefault: boolean;
  }): MemoTemplate {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    this.validate(params);
    const now = new Date();
    return new MemoTemplate(
      null,
      params.userId,
      params.name,
      params.content,
      params.isDefault,
      now,
      now,
    );
  }

  update(params: { name: string; content: string; isDefault: boolean }): void {
    MemoTemplate.validate(params);
    this._name = params.name;
    this._content = params.content;
    this._isDefault = params.isDefault;
    this._updated = new Date();
  }

  static fromDatabase(
    id: string,
    userId: string,
    name: string,
    content: string,
    isDefault: boolean,
    created: Date,
    updated: Date,
  ): MemoTemplate {
    return new MemoTemplate(
      id,
      userId,
      name,
      content,
      isDefault,
      created,
      updated,
    );
  }
}
