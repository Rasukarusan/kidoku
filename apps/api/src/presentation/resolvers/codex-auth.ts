import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DisconnectCodexAuthUseCase } from '../../application/usecases/codex-auth/disconnect-codex-auth';
import { GetCodexAuthStatusUseCase } from '../../application/usecases/codex-auth/get-codex-auth-status';
import { PollCodexDeviceAuthUseCase } from '../../application/usecases/codex-auth/poll-codex-device-auth';
import { StartCodexDeviceAuthUseCase } from '../../application/usecases/codex-auth/start-codex-device-auth';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import {
  CodexAuthStatusResponse,
  CodexDeviceAuthResponse,
  PollCodexDeviceAuthInput,
  PollCodexDeviceAuthResponse,
} from '../dto/codex-auth';

/**
 * AI読書分析で使うChatGPTアカウント接続のAPI。
 * 生成は各ユーザー自身のサブスクリプション枠で行うため、接続はユーザーごとに管理する。
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class CodexAuthResolver {
  constructor(
    private readonly getCodexAuthStatusUseCase: GetCodexAuthStatusUseCase,
    private readonly startCodexDeviceAuthUseCase: StartCodexDeviceAuthUseCase,
    private readonly pollCodexDeviceAuthUseCase: PollCodexDeviceAuthUseCase,
    private readonly disconnectCodexAuthUseCase: DisconnectCodexAuthUseCase,
  ) {}

  @Query(() => CodexAuthStatusResponse)
  async codexAuthStatus(
    @CurrentUser() user: { id: string },
  ): Promise<CodexAuthStatusResponse> {
    const auth = await this.getCodexAuthStatusUseCase.execute(user.id);
    if (!auth) {
      return {
        connected: false,
        accountId: null,
        expiresAt: null,
        expired: false,
      };
    }
    return {
      connected: true,
      accountId: auth.accountId,
      expiresAt: auth.expiresAt,
      expired: auth.isExpired(new Date()),
    };
  }

  @Mutation(() => CodexDeviceAuthResponse)
  async startCodexDeviceAuth(): Promise<CodexDeviceAuthResponse> {
    return await this.startCodexDeviceAuthUseCase.execute();
  }

  @Mutation(() => PollCodexDeviceAuthResponse)
  async pollCodexDeviceAuth(
    @CurrentUser() user: { id: string },
    @Args('input') input: PollCodexDeviceAuthInput,
  ): Promise<PollCodexDeviceAuthResponse> {
    const result = await this.pollCodexDeviceAuthUseCase.execute(
      user.id,
      input.deviceAuthId,
      input.userCode,
    );
    return {
      status: result.status,
      accountId: result.status === 'authorized' ? result.accountId : null,
    };
  }

  @Mutation(() => Boolean)
  async disconnectCodexAuth(
    @CurrentUser() user: { id: string },
  ): Promise<boolean> {
    await this.disconnectCodexAuthUseCase.execute(user.id);
    return true;
  }
}
