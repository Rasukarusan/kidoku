export class AiSummary {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _sheetId: number,
    private readonly _analysis: Record<string, unknown>,
    private readonly _token: number,
    private readonly _created: Date,
    private readonly _updated: Date,
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
  get analysis(): Record<string, unknown> {
    return this._analysis;
  }
  get token(): number {
    return this._token;
  }
  get created(): Date {
    return this._created;
  }
  get updated(): Date {
    return this._updated;
  }

  static create(
    userId: string,
    sheetId: number,
    analysis: Record<string, unknown>,
    token: number,
  ): AiSummary {
    const now = new Date();
    return new AiSummary(null, userId, sheetId, analysis, token, now, now);
  }

  static fromDatabase(
    id: string,
    userId: string,
    sheetId: number,
    analysis: Record<string, unknown>,
    token: number,
    created: Date,
    updated: Date,
  ): AiSummary {
    return new AiSummary(
      id,
      userId,
      sheetId,
      analysis,
      token,
      created,
      updated,
    );
  }
}
