/**
 * Codex CLIが使うOAuthクライアント / ChatGPTバックエンドの定数。
 * ChatGPTサブスクリプションの枠でLLMを利用するため、従量課金のAPIキーは使わない。
 */

export const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
export const ISSUER = 'https://auth.openai.com';
export const TOKEN_URL = `${ISSUER}/oauth/token`;

// デバイス認可フロー（localhostのリダイレクトを必要としない）。
// OpenAI独自のdeviceauthエンドポイントを使う（RFC8628準拠ではない）。
export const DEVICE_USERCODE_URL = `${ISSUER}/api/accounts/deviceauth/usercode`;
export const DEVICE_TOKEN_URL = `${ISSUER}/api/accounts/deviceauth/token`;
export const DEVICE_VERIFICATION_URL = `${ISSUER}/codex/device`;
export const DEVICE_REDIRECT_URI = `${ISSUER}/deviceauth/callback`;

/** リフレッシュ時に要求するスコープ */
export const SCOPE = 'openid profile email offline_access';

/** ChatGPTバックエンド側のResponses APIエンドポイント */
export const RESPONSES_URL = 'https://chatgpt.com/backend-api/codex/responses';

// OpenAIがトラフィックの発信元を識別するためのヘッダー値
export const ORIGINATOR = 'codex_cli_rs';
export const USER_AGENT = 'codex_cli_rs/0.0.0 (kidoku ai summary)';

/**
 * ChatGPTアカウント経由で使えるモデルは頻繁に入れ替わるため環境変数で上書きできる。
 * 廃止済みモデルを指定すると生成が失敗する。
 */
export const DEFAULT_MODEL = 'gpt-5.4';

/** デバイス認可のポーリング間隔（サーバー側から返らなかった場合の既定値） */
export const DEFAULT_POLL_INTERVAL_SECONDS = 5;
