import { CodexTokenSet } from '../models/codex-auth';

/** デバイス認可の開始結果。ユーザーはverificationUrlでuserCodeを入力する */
export type CodexDeviceAuthorization = {
  deviceAuthId: string;
  userCode: string;
  verificationUrl: string;
  intervalSeconds: number;
};

/** デバイス認可のポーリング結果 */
export type CodexDevicePollResult =
  | { status: 'pending' }
  | { status: 'authorized'; tokens: CodexTokenSet };

/**
 * ChatGPTアカウントのOAuth（デバイス認可フロー）ゲートウェイ。
 * トークンの取得のみを担い、永続化やユーザーへの紐付けは呼び出し側が行う。
 */
export abstract class ICodexOAuthGateway {
  /** デバイス認可を開始し、ユーザーに提示する情報を返す */
  abstract startDeviceAuthorization(): Promise<CodexDeviceAuthorization>;

  /** 認可状況を1回だけ確認する。認可済みならトークンに交換して返す */
  abstract pollDeviceAuthorization(
    deviceAuthId: string,
    userCode: string,
  ): Promise<CodexDevicePollResult>;

  /** refresh_tokenで新しいトークンを取得する */
  abstract refreshTokens(refreshToken: string): Promise<CodexTokenSet>;
}
