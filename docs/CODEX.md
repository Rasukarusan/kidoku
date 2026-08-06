# AI読書分析のLLM接続（ChatGPT連携）

AI読書分析は、**各ユーザーが自分のChatGPTアカウントを接続し、そのサブスクリプション枠で生成する**。
サービス側でOpenAI APIキーは持たない。

> ⚠️ 公式クライアント以外からのサブスク利用はOpenAIの利用規約で明示的に認められておらず、
> アカウント停止のリスクがある。接続はユーザー自身の判断で行う前提。

## 仕組み

公式Codex CLIが使うOAuthクライアント（client_id / scope / エンドポイント）を再現してChatGPTアカウントで
ログインし、取得したトークンでChatGPTバックエンドのResponses API
（`chatgpt.com/backend-api/codex/responses`）を叩く。課金は接続したユーザーのChatGPTプラン枠から消費される。

```
[接続: デバイス認可フロー（localhostのリダイレクトが不要）]
  startCodexDeviceAuth（GraphQL Mutation）
   → OpenAIのdeviceauth/usercodeでuser_codeを取得（RFC8628準拠ではない独自実装）
   → ユーザーが検証URL（auth.openai.com/codex/device）でuser_codeを入力
  pollCodexDeviceAuth（フロントがintervalSecondsごとに呼ぶ）
   → 認可されるとauthorization_code + code_verifierが返る（PKCEのverifierはOpenAI側が生成）
   → /oauth/tokenでaccess/refresh/id_tokenに交換
   → id_tokenのJWTからchatgpt_account_idを抽出
   → AES-256-GCMで暗号化してcodex_authテーブルへ保存（ログイン中のユーザーに紐づく1件）

[生成: POST /ai-summary/generate]
  そのユーザーのトークンを取り出し（期限5分前ならリフレッシュして保存し直す）
   → プロンプトをResponses APIのinstructions + inputに変換
   → Authorization: Bearer + chatgpt-account-idヘッダー付きでSSEを受信
   → response.output_text.deltaをテキストストリームとしてクライアントへ中継
   → response.completedのusage.total_tokensをai_summaries.tokenに記録
```

`codex_auth`は`user_id`を主キーに持ち、ユーザー削除時にカスケード削除される。
未接続のユーザーはAI分析を実行できない。

## 接続の導線

- **AI分析の実行確認モーダル**（`Confirm`）: 未接続のうちはOKボタンが「ChatGPTと接続する」に切り替わり、押すとその場にデバイスコードが出る。接続が完了するとOKボタンに戻り、そのまま分析を実行できる
- **設定画面**（`/settings/codex`）: 接続状況の確認・別アカウントへの切り替え・接続解除

## ファイル構成

| パス | 役割 |
|---|---|
| `apps/api/src/domain/models/codex-auth.ts` | トークンのドメインモデル（ユーザー紐付け・期限判定・リフレッシュ・account_id抽出） |
| `apps/api/src/domain/repositories/codex-auth.ts` | トークン永続化のインターフェース |
| `apps/api/src/domain/gateways/codex-oauth.ts` | デバイス認可・トークン取得のインターフェース |
| `apps/api/src/infrastructure/ai/codex/config.ts` | Codex CLI由来の定数（client_id / エンドポイント / 既定モデル） |
| `apps/api/src/infrastructure/ai/codex/token-cipher.ts` | AES-256-GCM暗号化（鍵は`NEXTAUTH_SECRET`から派生） |
| `apps/api/src/infrastructure/ai/codex/codex-oauth.gateway.ts` | デバイス認可フローとトークン交換・リフレッシュ |
| `apps/api/src/infrastructure/ai/codex/codex-access-token.provider.ts` | ユーザーごとの有効なaccess_token供給と自動リフレッシュ |
| `apps/api/src/infrastructure/ai/codex/codex-chat.gateway.ts` | Responses APIのSSEをJSONストリームに変換（`IAiChatGateway`実装） |
| `apps/api/src/infrastructure/repositories/codex-auth.ts` | `codex_auth`テーブルへの読み書き |
| `apps/api/src/shared/ai/json-object-stream.ts` | ストリームから最上位のJSONオブジェクトのみを抽出 |
| `apps/api/src/application/usecases/codex-auth/` | 接続状況取得・ログイン開始・ポーリング・接続解除 |
| `apps/api/src/presentation/resolvers/codex-auth.ts` | 接続管理のGraphQLリゾルバー（ログインユーザー自身の接続を操作） |
| `apps/web/src/features/codex/` | 接続フック（`useCodexConnect`）・デバイスコード表示・設定画面用の接続パネル |

## 環境変数

| 変数 | 必須 | 説明 |
|---|---|---|
| `NEXTAUTH_SECRET` | ○ | トークン暗号化鍵の派生元。変更すると復号できなくなり全ユーザーの再接続が必要 |
| `CODEX_MODEL` | - | 使用モデル。省略時は`gpt-5.4` |

## 運用メモ

- 接続にはChatGPT側の設定で **Allow device code login**（Settings → Security）を有効にする必要がある。
- 使えるモデルは頻繁に入れ替わり、動的な一覧APIは無い。生成が失敗するようになったら`CODEX_MODEL`を見直す。
- 生成が失敗すると、ストリームに`ERROR:`付きの案内が流れフロントにエラー表示される。原因（未接続・モデル廃止など）はAPIのログに出る。
- Responses APIは`response_format`を受け付けないため、JSONは指示文と`JsonObjectStream`で担保している。
