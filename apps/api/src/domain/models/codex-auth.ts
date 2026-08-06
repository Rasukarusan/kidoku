/** access_tokenの期限が近づいたと判断するマージン */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/** OAuthトークンエンドポイントから受け取ったトークン一式 */
export type CodexTokenSet = {
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  expiresInSeconds: number;
};

/** JWTのpayloadをデコードする（署名検証はしない） */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('Invalid JWT');
  }
  return JSON.parse(
    Buffer.from(payload, 'base64url').toString('utf8'),
  ) as Record<string, unknown>;
}

/** id_tokenのクレームからChatGPTのアカウントIDを取り出す */
export function accountIdFromIdToken(idToken: string): string | null {
  try {
    const claims = decodeJwtPayload(idToken);
    const auth = (claims['https://api.openai.com/auth'] ?? {}) as Record<
      string,
      string | undefined
    >;
    return auth.chatgpt_account_id ?? auth.chatgpt_user_id ?? null;
  } catch {
    return null;
  }
}

/**
 * ユーザーが接続したChatGPTアカウントのOAuthトークン。
 * AI読書分析はこのトークンで、そのユーザー自身のサブスクリプション枠を使って生成する。
 */
export class CodexAuth {
  private constructor(
    private readonly _userId: string,
    private readonly _accessToken: string,
    private readonly _refreshToken: string,
    private readonly _idToken: string | null,
    private readonly _accountId: string | null,
    private readonly _expiresAt: Date,
  ) {}

  /** トークンレスポンスから新規作成する */
  static create(userId: string, tokens: CodexTokenSet, now: Date): CodexAuth {
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!tokens.accessToken) {
      throw new Error('access_token is required');
    }
    if (!tokens.refreshToken) {
      throw new Error('refresh_token is required');
    }
    return new CodexAuth(
      userId,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.idToken,
      tokens.idToken ? accountIdFromIdToken(tokens.idToken) : null,
      new Date(now.getTime() + tokens.expiresInSeconds * 1000),
    );
  }

  static fromDatabase(params: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    idToken: string | null;
    accountId: string | null;
    expiresAt: Date;
  }): CodexAuth {
    return new CodexAuth(
      params.userId,
      params.accessToken,
      params.refreshToken,
      params.idToken,
      params.accountId,
      params.expiresAt,
    );
  }

  /**
   * リフレッシュしたトークンで新しいインスタンスを作る。
   * レスポンスに含まれないrefresh_token・id_tokenは現在の値を引き継ぐ。
   */
  refresh(tokens: Partial<CodexTokenSet>, now: Date): CodexAuth {
    if (!tokens.accessToken) {
      throw new Error('access_token is required');
    }
    const idToken = tokens.idToken ?? this._idToken;
    return new CodexAuth(
      this._userId,
      tokens.accessToken,
      tokens.refreshToken || this._refreshToken,
      idToken,
      (idToken ? accountIdFromIdToken(idToken) : null) ?? this._accountId,
      new Date(now.getTime() + (tokens.expiresInSeconds ?? 3600) * 1000),
    );
  }

  /** 期限切れ、または期限が近くリフレッシュすべきか */
  needsRefresh(now: Date): boolean {
    return this._expiresAt.getTime() - now.getTime() <= REFRESH_MARGIN_MS;
  }

  isExpired(now: Date): boolean {
    return this._expiresAt.getTime() <= now.getTime();
  }

  get userId(): string {
    return this._userId;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  get idToken(): string | null {
    return this._idToken;
  }

  get accountId(): string | null {
    return this._accountId;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }
}
