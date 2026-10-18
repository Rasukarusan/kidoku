# Kidoku MCP

既存の Next.js アプリ内の `/api/mcp` で読書記録を読み取れます。
別サーバー、追加の npm 依存、Redis は不要です。

## 接続

1. Kidoku の「設定 → MCP 接続」で接続先 URL を確認します。本番では `https://kidoku.net/api/mcp` です。
2. OAuth 対応の MCP クライアントに URL を登録します。
3. 既存の Google ログイン（OIDC / NextAuth）で認証し、接続アプリの読み取りを許可します。

`list_books` は自分の読書記録をページごとに返します。`query` でタイトル・著者・メモを検索できます。
`get_book` は自分の記録の ID を受け取り、メモ全文を含む記録を返します。
他のユーザーの記録やメモにはアクセスできません。書き込みツールはありません。
接続したアプリは非公開のメモも読めるため、認可画面で明示的に許可します。
「設定 → MCP 接続」で解除すると、アクセストークンと更新トークンを即時失効します。

## 認証方式

ユーザー認証は既存の Google OIDC、MCP クライアントへの権限付与は OAuth Authorization Code + PKCE S256 です。
Google の ID トークンを MCP API のアクセストークンとして受け入れることはありません。
パーソナルアクセストークンも MCP では使いません（既存 REST API は従来どおりです）。

- Protected Resource Metadata: `/.well-known/oauth-protected-resource/api/mcp`
- Authorization Server Metadata: `/.well-known/oauth-authorization-server`
- 認可画面: `/mcp/authorize`
- クライアントの識別: Client ID Metadata Document（CIMD）と動的クライアント登録（`/api/mcp/oauth/register`、public client / `none`）
- トークン交換・更新: `/api/mcp/oauth/token`
- 失効: `/api/mcp/oauth/revoke`
- スコープ: `books:read`

認可コードは 5 分で失効し、一度だけ交換できます。アクセストークンは 1 時間、接続は最大 30 日です。
更新トークンは使用するたびに交換され、以前のアクセストークンも失効します。
コード・トークンは SHA-256 ハッシュのみ DB に保存します。
リダイレクト URI は登録された値と完全一致する必要があります。loopback（`http://localhost` / `127.0.0.1` / `[::1]`）のみポート番号を無視して照合します（RFC 8252）。
OAuth の `resource` は接続先の `/api/mcp` URL に限定されます。
認可レスポンスには `iss` を付与します（RFC 9207）。

### クライアントの識別

`client_id` が HTTPS の URL の場合は CIMD として扱います。
Kidoku はその URL からメタデータ JSON を取得し、`client_id` が URL と一致すること、`redirect_uris` に要求のリダイレクト URI が含まれることを確認します。
CIMD のクライアントは DB に保存せず、取得結果を `Cache-Control` の `max-age`（60 秒〜24 時間、指定なしは 1 時間）に従ってメモリにキャッシュします。
同意画面にはメタデータを公開しているドメインを表示します。

メタデータの取得はサーバーから任意の URL へ接続するため、次の制限を設けます。

- HTTPS・既定ポート・パス付きの URL のみ。IP アドレス直指定は不可
- 名前解決した接続先がプライベート・loopback・リンクローカル等のアドレスなら接続しない
- リダイレクトは追わない。応答は 200 の JSON・5KB 以内・5 秒以内
- `client_secret` を含むメタデータや `token_endpoint_auth_method` が `none` 以外のものは拒否

それ以外の `client_id` は動的クライアント登録で発行した ID として `mcp_clients` から読みます。
登録は認証なしで受け付けるため、登録のたびに期限切れの grant と、接続に使われないまま 1 日経過した登録を削除します。

MCP は Streamable HTTP の JSON レスポンスを使用し、SSE 接続・セッション ID は発行しません。
対応プロトコルは `2025-03-26`、`2025-06-18`、`2025-11-25` です。
POST には `Accept: application/json, text/event-stream` と `Content-Type: application/json` を送ります。
GET / DELETE のストリーム・セッション操作には 405 を返します。
動的クライアント登録を公開する場合、既存のリバースプロキシのレート制限を適用してください。

## 配置

`NEXTAUTH_URL`（未設定なら `NEXT_PUBLIC_HOST`）を公開オリジンに設定します。
本番は HTTPS 必須、ローカル開発では HTTP の localhost / loopback が使えます。
既存の `NEXTAUTH_SECRET`、Google OAuth 設定、データベース設定を再利用します。
Google 側のリダイレクト URI は既存の `/api/auth/callback/google` のままです。
Google への新しいクライアント登録は必要ありません。

デプロイ前にスキーマを反映し、Prisma Client を再生成します。

```sh
pnpm --filter web exec prisma db push
pnpm --filter web exec prisma generate
pnpm --filter api exec prisma generate
```

追加するテーブルは `mcp_clients`（動的クライアント登録）と `mcp_grants`（ユーザーごとの接続）です。
`mcp_grants.client_id` は登録 ID または CIMD の URL で、接続時のアプリ名を `client_name` に保持します。
両アプリの Prisma スキーマに同じ定義を追加しています。
追加スキーマの SQL は `docs/sql/mcp.sql` にあります。

ローカルの裏口ログインを有効にしている場合、その NextAuth セッションでも認可を検証できます。
本番では既存の運用どおり `NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=false` にします。
