import { ICodexOAuthGateway } from '../../../domain/gateways/codex-oauth';
import { CodexTokenSet } from '../../../domain/models/codex-auth';
import { ICodexAuthRepository } from '../../../domain/repositories/codex-auth';
import { PollCodexDeviceAuthUseCase } from './poll-codex-device-auth';

describe('PollCodexDeviceAuthUseCase', () => {
  const tokens: CodexTokenSet = {
    accessToken: 'access',
    refreshToken: 'refresh',
    idToken: null,
    expiresInSeconds: 3600,
  };

  const buildUseCase = (
    pollResult: Awaited<
      ReturnType<ICodexOAuthGateway['pollDeviceAuthorization']>
    >,
  ) => {
    const gateway = {
      startDeviceAuthorization: jest.fn(),
      pollDeviceAuthorization: jest.fn().mockResolvedValue(pollResult),
      refreshTokens: jest.fn(),
    } as unknown as jest.Mocked<ICodexOAuthGateway>;
    const repository = {
      findByUserId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      deleteByUserId: jest.fn(),
    } as unknown as jest.Mocked<ICodexAuthRepository>;
    return {
      useCase: new PollCodexDeviceAuthUseCase(gateway, repository),
      gateway,
      repository,
    };
  };

  it('認可済みならログインしたユーザーのトークンとして保存する', async () => {
    const { useCase, gateway, repository } = buildUseCase({
      status: 'authorized',
      tokens,
    });

    const result = await useCase.execute('user-1', 'device-1', 'CODE-1');

    expect(gateway.pollDeviceAuthorization).toHaveBeenCalledWith(
      'device-1',
      'CODE-1',
    );
    const saved = repository.save.mock.calls[0][0];
    expect(saved.userId).toBe('user-1');
    expect(saved.accessToken).toBe('access');
    expect(result.status).toBe('authorized');
  });

  it('認可待ちなら保存しない', async () => {
    const { useCase, repository } = buildUseCase({ status: 'pending' });

    const result = await useCase.execute('user-1', 'device-1', 'CODE-1');

    expect(repository.save).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'pending' });
  });
});
