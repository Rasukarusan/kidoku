export class User {
  private constructor(
    private readonly _id: string,
    private _name: string | null,
    private readonly _email: string | null,
    private readonly _image: string | null,
    private readonly _admin: boolean,
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

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('ユーザー名は必須です');
    }
    this._name = newName.trim();
  }

  static fromDatabase(
    id: string,
    name: string | null,
    email: string | null,
    image: string | null,
    admin: boolean,
  ): User {
    return new User(id, name, email, image, admin);
  }
}
