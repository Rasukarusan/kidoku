import { Module } from '@nestjs/common';
import { DisconnectCodexAuthUseCase } from '../../application/usecases/codex-auth/disconnect-codex-auth';
import { GetCodexAuthStatusUseCase } from '../../application/usecases/codex-auth/get-codex-auth-status';
import { PollCodexDeviceAuthUseCase } from '../../application/usecases/codex-auth/poll-codex-device-auth';
import { StartCodexDeviceAuthUseCase } from '../../application/usecases/codex-auth/start-codex-device-auth';
import { IAiChatGateway } from '../../domain/gateways/ai-chat';
import { ICodexOAuthGateway } from '../../domain/gateways/codex-oauth';
import { ICodexAuthRepository } from '../../domain/repositories/codex-auth';
import { CodexAccessTokenProvider } from '../../infrastructure/ai/codex/codex-access-token.provider';
import { CodexChatGateway } from '../../infrastructure/ai/codex/codex-chat.gateway';
import { CodexOAuthGateway } from '../../infrastructure/ai/codex/codex-oauth.gateway';
import { TokenCipher } from '../../infrastructure/ai/codex/token-cipher';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { CodexAuthRepository } from '../../infrastructure/repositories/codex-auth';
import { CodexAuthResolver } from '../resolvers/codex-auth';

/**
 * ChatGPTアカウント（Codex）接続のモジュール。
 * ログイン管理APIを提供し、LLM呼び出し口(IAiChatGateway)を他モジュールへ公開する。
 */
@Module({
  imports: [AuthModule],
  providers: [
    CodexAuthResolver,
    GetCodexAuthStatusUseCase,
    StartCodexDeviceAuthUseCase,
    PollCodexDeviceAuthUseCase,
    DisconnectCodexAuthUseCase,
    TokenCipher,
    CodexAccessTokenProvider,
    {
      provide: ICodexAuthRepository,
      useClass: CodexAuthRepository,
    },
    {
      provide: ICodexOAuthGateway,
      useClass: CodexOAuthGateway,
    },
    {
      provide: IAiChatGateway,
      useClass: CodexChatGateway,
    },
  ],
  exports: [IAiChatGateway],
})
export class CodexModule {}
