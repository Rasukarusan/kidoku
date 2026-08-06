import { Injectable } from '@nestjs/common';
import { CodexAuth } from '../../../domain/models/codex-auth';
import { ICodexAuthRepository } from '../../../domain/repositories/codex-auth';

/**
 * ユーザーのChatGPTアカウント接続状況を取得する。未接続ならnullを返す。
 */
@Injectable()
export class GetCodexAuthStatusUseCase {
  constructor(private readonly codexAuthRepository: ICodexAuthRepository) {}

  async execute(userId: string): Promise<CodexAuth | null> {
    return await this.codexAuthRepository.findByUserId(userId);
  }
}
