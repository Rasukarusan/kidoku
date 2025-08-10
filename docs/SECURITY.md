# セキュリティ設定ガイド

## 認証フロー

1. **クライアント → Next.js**
   - NextAuthのセッションクッキーで認証
   - `/api/graphql`プロキシエンドポイントを使用

2. **Next.js → NestJS**
   - HMAC-SHA256署名付きヘッダーで認証
   - タイムスタンプによるリプレイ攻撃防止

## 必須設定

### 1. 環境変数の設定

```bash
# NEXTAUTH_SECRETの生成
openssl rand -base64 32
```

#### Next.js側 (.env.local)
```env
# NextAuth認証と内部API通信の署名に使用
NEXTAUTH_SECRET=生成した秘密鍵をここに設定
NESTJS_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

#### NestJS側 (.env)
```env
# Next.jsと同じNEXTAUTH_SECRETを設定（署名検証用）
NEXTAUTH_SECRET=生成した秘密鍵をここに設定
```

### 2. NestJSのアクセス制限

#### 開発環境
```typescript
// apps/api/src/main.ts
await app.listen(4000, 'localhost'); // localhostのみでリッスン
```

#### 本番環境（推奨設定）

1. **ネットワーク分離**
   - NestJSをプライベートネットワーク内に配置
   - Next.jsからのみアクセス可能に設定

2. **ファイアウォール設定例（UFW）**
```bash
# NestJSポートを外部からブロック
sudo ufw deny 4000

# 特定のIPからのみ許可（Next.jsサーバー）
sudo ufw allow from <Next.jsサーバーIP> to any port 4000
```

3. **Docker Compose設定例**
```yaml
services:
  api:
    ports:
      - "127.0.0.1:4000:4000"  # localhostのみにバインド
    networks:
      - internal

  web:
    networks:
      - internal
      - public

networks:
  internal:
    internal: true
  public:
```

4. **クラウド環境での設定**

**AWS**
- Security Groupでポート4000を内部VPCのみに制限
- ALB/NLBを使用して内部通信を制御

**Vercel + Railway/Render**
- NestJSを内部URLでデプロイ
- 環境変数で内部エンドポイントを設定

## セキュリティチェックリスト

- [ ] `NEXTAUTH_SECRET`が設定されている
- [ ] Next.jsとNestJSで同じ`NEXTAUTH_SECRET`を使用している
- [ ] NestJSが外部から直接アクセスできない
- [ ] 本番環境でHTTPS通信を使用している
- [ ] 環境変数が`.gitignore`に含まれている

## トラブルシューティング

### 認証エラーが発生する場合

1. **"Missing authentication headers"**
   - Next.jsがセッション情報を取得できていない
   - ログインし直してください

2. **"Invalid signature"**
   - `NEXTAUTH_SECRET`が一致していない
   - 両方のアプリで同じ値が設定されているか確認

3. **"Request timestamp is invalid or expired"**
   - サーバー間の時刻がずれている
   - NTPで時刻を同期してください