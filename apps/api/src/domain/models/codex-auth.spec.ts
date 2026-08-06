import { accountIdFromIdToken, CodexAuth } from './codex-auth';

/** テスト用のid_token（署名は検証しないためpayloadのみ有効な形にする） */
function buildIdToken(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.signature`;
}

const now = new Date('2026-01-01T00:00:00Z');

describe('accountIdFromIdToken', () => {
  it('chatgpt_account_idを取り出す', () => {
    const idToken = buildIdToken({
      'https://api.openai.com/auth': { chatgpt_account_id: 'account-1' },
    });
    expect(accountIdFromIdToken(idToken)).toBe('account-1');
  });

  it('chatgpt_account_idがない場合はchatgpt_user_idを使う', () => {
    const idToken = buildIdToken({
      'https://api.openai.com/auth': { chatgpt_user_id: 'user-1' },
    });
    expect(accountIdFromIdToken(idToken)).toBe('user-1');
  });

  it('デコードできない場合はnullを返す', () => {
    expect(accountIdFromIdToken('invalid')).toBeNull();
  });
});

describe('CodexAuth.create', () => {
  it('expires_inから期限を計算しaccount_idを埋める', () => {
    const auth = CodexAuth.create(
      'user-1',
      {
        accessToken: 'access',
        refreshToken: 'refresh',
        idToken: buildIdToken({
          'https://api.openai.com/auth': { chatgpt_account_id: 'account-1' },
        }),
        expiresInSeconds: 3600,
      },
      now,
    );

    expect(auth.accessToken).toBe('access');
    expect(auth.accountId).toBe('account-1');
    expect(auth.expiresAt).toEqual(new Date('2026-01-01T01:00:00Z'));
  });

  it('access_tokenがない場合はエラーになる', () => {
    expect(() =>
      CodexAuth.create(
        'user-1',
        {
          accessToken: '',
          refreshToken: 'refresh',
          idToken: null,
          expiresInSeconds: 3600,
        },
        now,
      ),
    ).toThrow('access_token is required');
  });

  it('refresh_tokenがない場合はエラーになる', () => {
    expect(() =>
      CodexAuth.create(
        'user-1',
        {
          accessToken: 'access',
          refreshToken: '',
          idToken: null,
          expiresInSeconds: 3600,
        },
        now,
      ),
    ).toThrow('refresh_token is required');
  });
});

describe('CodexAuth.refresh', () => {
  const current = CodexAuth.fromDatabase({
    userId: 'user-1',
    accessToken: 'old-access',
    refreshToken: 'old-refresh',
    idToken: buildIdToken({
      'https://api.openai.com/auth': { chatgpt_account_id: 'account-1' },
    }),
    accountId: 'account-1',
    expiresAt: now,
  });

  it('レスポンスに含まれない値は現在の値を引き継ぐ', () => {
    const refreshed = current.refresh(
      { accessToken: 'new-access', expiresInSeconds: 3600 },
      now,
    );

    expect(refreshed.accessToken).toBe('new-access');
    expect(refreshed.refreshToken).toBe('old-refresh');
    expect(refreshed.accountId).toBe('account-1');
    expect(refreshed.expiresAt).toEqual(new Date('2026-01-01T01:00:00Z'));
  });

  it('新しいrefresh_tokenが返れば置き換える', () => {
    const refreshed = current.refresh(
      {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresInSeconds: 3600,
      },
      now,
    );

    expect(refreshed.refreshToken).toBe('new-refresh');
  });
});

describe('CodexAuth の期限判定', () => {
  const auth = CodexAuth.fromDatabase({
    userId: 'user-1',
    accessToken: 'access',
    refreshToken: 'refresh',
    idToken: null,
    accountId: null,
    expiresAt: new Date('2026-01-01T01:00:00Z'),
  });

  it('期限まで5分以上あればリフレッシュ不要', () => {
    expect(auth.needsRefresh(new Date('2026-01-01T00:50:00Z'))).toBe(false);
  });

  it('期限まで5分以内ならリフレッシュが必要', () => {
    expect(auth.needsRefresh(new Date('2026-01-01T00:56:00Z'))).toBe(true);
  });

  it('期限を過ぎていれば期限切れ', () => {
    expect(auth.isExpired(new Date('2026-01-01T01:00:01Z'))).toBe(true);
    expect(auth.isExpired(new Date('2026-01-01T00:59:59Z'))).toBe(false);
  });
});
