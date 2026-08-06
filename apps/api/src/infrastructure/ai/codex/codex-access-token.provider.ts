import { Injectable } from '@nestjs/common';
import { ICodexOAuthGateway } from '../../../domain/gateways/codex-oauth';
import { CodexAuth } from '../../../domain/models/codex-auth';
import { ICodexAuthRepository } from '../../../domain/repositories/codex-auth';

/** ChatGPTアカウントを接続していないユーザーがLLMを呼び出したときのエラーメッセージ */
export const CODEX_NOT_CONNECTED_MESSAGE =
  'ChatGPTアカウントに接続されていません';

/**
 * ChatGPTバックエンドを叩くための有効なトークンをユーザーごとに供給する。
 * 期限が近い場合はリフレッシュして保存し直す。
 */
@Injectable()
export class CodexAccessTokenProvider {
  constructor(
    private readonly codexAuthRepository: ICodexAuthRepository,
    private readonly codexOAuthGateway: ICodexOAuthGateway,
  ) {}

  async get(userId: string): Promise<CodexAuth> {
    const auth = await this.codexAuthRepository.findByUserId(userId);
    if (!auth) {
      throw new Error(CODEX_NOT_CONNECTED_MESSAGE);
    }
    if (!auth.needsRefresh(new Date())) {
      return auth;
    }
    const tokens = await this.codexOAuthGateway.refreshTokens(
      auth.refreshToken,
    );
    const refreshed = auth.refresh(tokens, new Date());
    await this.codexAuthRepository.save(refreshed);
    return refreshed;
  }
}
