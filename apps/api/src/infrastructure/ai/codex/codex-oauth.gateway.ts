import { Injectable } from '@nestjs/common';
import {
  CodexDeviceAuthorization,
  CodexDevicePollResult,
  ICodexOAuthGateway,
} from '../../../domain/gateways/codex-oauth';
import { CodexTokenSet } from '../../../domain/models/codex-auth';
import {
  CLIENT_ID,
  DEFAULT_POLL_INTERVAL_SECONDS,
  DEVICE_REDIRECT_URI,
  DEVICE_TOKEN_URL,
  DEVICE_USERCODE_URL,
  DEVICE_VERIFICATION_URL,
  SCOPE,
  TOKEN_URL,
  USER_AGENT,
} from './config';

type UserCodeResponse = {
  device_auth_id?: string;
  user_code?: string;
  usercode?: string;
  interval?: string | number;
};

type AuthorizationCodeResponse = {
  authorization_code?: string;
  code_verifier?: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

const JSON_HEADERS = {
  'content-type': 'application/json',
  accept: 'application/json',
  'user-agent': USER_AGENT,
};

/**
 * デバイス認可フローによるChatGPTアカウントのOAuth。
 *
 * 1. usercodeを要求してuser_codeとdevice_auth_idを得る
 * 2. ユーザーは検証URLでuser_codeを入力する
 * 3. deviceauth/tokenをポーリングする（認可待ちは403/404）
 * 4. 認可されるとauthorization_codeとcode_verifierが返るのでトークンに交換する
 *
 * PKCEのcode_verifierはOpenAI側が生成して返す点が通常の認可コードフローと異なる。
 */
@Injectable()
export class CodexOAuthGateway implements ICodexOAuthGateway {
  async startDeviceAuthorization(): Promise<CodexDeviceAuthorization> {
    const res = await fetch(DEVICE_USERCODE_URL, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ client_id: CLIENT_ID }),
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          'デバイスコードログインが無効です。ChatGPTの設定（Settings → Security → Allow device code login）で有効化してください。',
        );
      }
      throw new Error(
        `デバイス認可の開始に失敗しました (${res.status}): ${await res.text()}`,
      );
    }

    const data = (await res.json()) as UserCodeResponse;
    const userCode = data.user_code ?? data.usercode;
    if (!data.device_auth_id || !userCode) {
      throw new Error('デバイス認可の応答に必要な値がありません');
    }
    const interval =
      typeof data.interval === 'string'
        ? parseInt(data.interval, 10)
        : data.interval;
    return {
      deviceAuthId: data.device_auth_id,
      userCode,
      verificationUrl: DEVICE_VERIFICATION_URL,
      intervalSeconds:
        interval && Number.isFinite(interval)
          ? interval
          : DEFAULT_POLL_INTERVAL_SECONDS,
    };
  }

  async pollDeviceAuthorization(
    deviceAuthId: string,
    userCode: string,
  ): Promise<CodexDevicePollResult> {
    const res = await fetch(DEVICE_TOKEN_URL, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        device_auth_id: deviceAuthId,
        user_code: userCode,
      }),
    });

    // 403 / 404 はまだ認可されていないことを表す
    if (res.status === 403 || res.status === 404) {
      return { status: 'pending' };
    }
    if (!res.ok) {
      throw new Error(
        `認可状況の確認に失敗しました (${res.status}): ${await res.text()}`,
      );
    }

    const code = (await res.json()) as AuthorizationCodeResponse;
    if (!code.authorization_code || !code.code_verifier) {
      throw new Error('認可応答にauthorization_codeがありません');
    }

    const tokens = await this.requestTokens({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code.authorization_code,
      code_verifier: code.code_verifier,
      redirect_uri: DEVICE_REDIRECT_URI,
    });
    return { status: 'authorized', tokens: toTokenSet(tokens) };
  }

  async refreshTokens(refreshToken: string): Promise<CodexTokenSet> {
    const tokens = await this.requestTokens({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
      scope: SCOPE,
    });
    return toTokenSet(tokens);
  }

  private async requestTokens(
    params: Record<string, string>,
  ): Promise<TokenResponse> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    if (!res.ok) {
      throw new Error(
        `トークンの取得に失敗しました (${res.status}): ${await res.text()}`,
      );
    }
    return (await res.json()) as TokenResponse;
  }
}

function toTokenSet(tokens: TokenResponse): CodexTokenSet {
  return {
    accessToken: tokens.access_token ?? '',
    refreshToken: tokens.refresh_token ?? '',
    idToken: tokens.id_token ?? null,
    expiresInSeconds: tokens.expires_in ?? 3600,
  };
}
