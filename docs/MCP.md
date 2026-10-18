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
- クライアント登録: `/api/mcp/oauth/register`（public client / `none`）
- トークン交換・更新: `/api/mcp/oauth/token`
- 失効: `/api/mcp/oauth/revoke`
- スコープ: `books:read`

認可コードは 5 分で失効し、一度だけ交換できます。アクセストークンは 1 時間、接続は最大 30 日です。
更新トークンは使用するたびに交換され、以前のアクセストークンも失効します。
コード・トークンは SHA-256 ハッシュのみ DB に保存します。
リダイレクト URI はクライアント登録時の値と完全一致する必要があります。
OAuth の `resource` は接続先の `/api/mcp` URL に限定されます。

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

追加するテーブルは `mcp_clients` と `mcp_grants` です。
両アプリの Prisma スキーマに同じ定義を追加しています。
期限切れの grant は `expires_at` を条件として定期削除できます。
追加スキーマの SQL は `docs/sql/mcp.sql` にあります。

ローカルの裏口ログインを有効にしている場合、その NextAuth セッションでも認可を検証できます。
本番では既存の運用どおり `NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=false` にします。
