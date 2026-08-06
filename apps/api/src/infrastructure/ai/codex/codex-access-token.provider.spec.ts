import { ICodexOAuthGateway } from '../../../domain/gateways/codex-oauth';
import { CodexAuth, CodexTokenSet } from '../../../domain/models/codex-auth';
import { ICodexAuthRepository } from '../../../domain/repositories/codex-auth';
import {
  CODEX_NOT_CONNECTED_MESSAGE,
  CodexAccessTokenProvider,
} from './codex-access-token.provider';

describe('CodexAccessTokenProvider', () => {
  const buildAuth = (expiresAt: Date) =>
    CodexAuth.fromDatabase({
      userId: 'user-1',
      accessToken: 'access',
      refreshToken: 'refresh',
      idToken: null,
      accountId: 'account-1',
      expiresAt,
    });

  const refreshedTokens: CodexTokenSet = {
    accessToken: 'new-access',
    refreshToken: 'new-refresh',
    idToken: null,
    expiresInSeconds: 3600,
  };

  const buildProvider = (stored: CodexAuth | null) => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue(stored),
      save: jest.fn().mockResolvedValue(undefined),
      deleteByUserId: jest.fn(),
    } as unknown as jest.Mocked<ICodexAuthRepository>;
    const gateway = {
      startDeviceAuthorization: jest.fn(),
      pollDeviceAuthorization: jest.fn(),
      refreshTokens: jest.fn().mockResolvedValue(refreshedTokens),
    } as unknown as jest.Mocked<ICodexOAuthGateway>;
    return {
      provider: new CodexAccessTokenProvider(repository, gateway),
      repository,
      gateway,
    };
  };

  it('未接続ならエラーになる', async () => {
    const { provider } = buildProvider(null);

    await expect(provider.get('user-1')).rejects.toThrow(
      CODEX_NOT_CONNECTED_MESSAGE,
    );
  });

  it('期限に余裕があればそのまま返す', async () => {
    const stored = buildAuth(new Date(Date.now() + 60 * 60 * 1000));
    const { provider, gateway } = buildProvider(stored);

    await expect(provider.get('user-1')).resolves.toBe(stored);
    expect(gateway.refreshTokens).not.toHaveBeenCalled();
  });

  it('期限が近ければリフレッシュして保存する', async () => {
    const stored = buildAuth(new Date(Date.now() + 60 * 1000));
    const { provider, repository, gateway } = buildProvider(stored);

    const result = await provider.get('user-1');

    expect(gateway.refreshTokens).toHaveBeenCalledWith('refresh');
    expect(result.accessToken).toBe('new-access');
    expect(result.userId).toBe('user-1');
    expect(repository.save).toHaveBeenCalledWith(result);
  });
});
