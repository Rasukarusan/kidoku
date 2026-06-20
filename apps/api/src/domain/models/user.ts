export class User {
  private constructor(
    private readonly _id: string,
    private _name: string | null,
    private readonly _email: string | null,
    private readonly _image: string | null,
    private readonly _admin: boolean,
    private _suiAddress: string | null,
  ) {}

  get id(): string {
    return this._id;
  }
  get name(): string | null {
    return this._name;
  }
  get email(): string | null {
    return this._email;
  }
  get image(): string | null {
    return this._image;
  }
  get admin(): boolean {
    return this._admin;
  }
  get suiAddress(): string | null {
    return this._suiAddress;
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('ユーザー名は必須です');
    }
    this._name = newName.trim();
  }

  /**
   * Sui の受取アドレスを更新する。
   * 空文字は未設定（null）として扱い、それ以外は 0x + 16進の形式を要求する。
   */
  updateSuiAddress(newAddress: string | null): void {
    const trimmed = (newAddress ?? '').trim();
    if (trimmed === '') {
      this._suiAddress = null;
      return;
    }
    if (!/^0x[0-9a-fA-F]{1,64}$/.test(trimmed)) {
      throw new Error('Suiアドレスの形式が正しくありません');
    }
    this._suiAddress = trimmed;
  }

  static fromDatabase(
    id: string,
    name: string | null,
    email: string | null,
    image: string | null,
    admin: boolean,
    suiAddress: string | null = null,
  ): User {
    return new User(id, name, email, image, admin, suiAddress);
  }
}
