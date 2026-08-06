import { Injectable } from '@nestjs/common';
import {
  CodexDeviceAuthorization,
  ICodexOAuthGateway,
} from '../../../domain/gateways/codex-oauth';

/**
 * ChatGPTアカウントのデバイス認可を開始する。
 * 返したワンタイムコードをユーザーが検証URLで入力するとログインが完了する。
 */
@Injectable()
export class StartCodexDeviceAuthUseCase {
  constructor(private readonly codexOAuthGateway: ICodexOAuthGateway) {}

  async execute(): Promise<CodexDeviceAuthorization> {
    return await this.codexOAuthGateway.startDeviceAuthorization();
  }
}
