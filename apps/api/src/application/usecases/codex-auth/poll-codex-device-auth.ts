import { Injectable } from '@nestjs/common';
import { ICodexOAuthGateway } from '../../../domain/gateways/codex-oauth';
import { CodexAuth } from '../../../domain/models/codex-auth';
import { ICodexAuthRepository } from '../../../domain/repositories/codex-auth';

export type PollCodexDeviceAuthResult =
  | { status: 'pending' }
  | { status: 'authorized'; accountId: string | null };

/**
 * デバイス認可の状況を1回だけ確認する。
 * 認可済みならトークンをそのユーザーのものとして保存し、AI読書分析で使えるようにする。
 */
@Injectable()
export class PollCodexDeviceAuthUseCase {
  constructor(
    private readonly codexOAuthGateway: ICodexOAuthGateway,
    private readonly codexAuthRepository: ICodexAuthRepository,
  ) {}

  async execute(
    userId: string,
    deviceAuthId: string,
    userCode: string,
  ): Promise<PollCodexDeviceAuthResult> {
    const result = await this.codexOAuthGateway.pollDeviceAuthorization(
      deviceAuthId,
      userCode,
    );
    if (result.status === 'pending') {
      return { status: 'pending' };
    }
    const auth = CodexAuth.create(userId, result.tokens, new Date());
    await this.codexAuthRepository.save(auth);
    return { status: 'authorized', accountId: auth.accountId };
  }
}
