import { Injectable } from '@nestjs/common';
import { ICodexAuthRepository } from '../../../domain/repositories/codex-auth';

/**
 * ユーザーが接続したChatGPTアカウントのトークンを破棄する。
 */
@Injectable()
export class DisconnectCodexAuthUseCase {
  constructor(private readonly codexAuthRepository: ICodexAuthRepository) {}

  async execute(userId: string): Promise<void> {
    await this.codexAuthRepository.deleteByUserId(userId);
  }
}
