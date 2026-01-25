# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要

pushする前にpnpm lint:fixを行ってください。

## プロジェクト概要

Kidoku（きどく）は、読書記録・分析アプリケーションです。モノレポ構成（Turborepo + pnpm）で、Next.jsフロントエンドとNestJS GraphQL APIを統合しています。

## アーキテクチャ概要

### 認証フロー

1. **フロントエンド**: NextAuth.js（Google OAuth + 裏口ログイン）でセッション管理
2. **プロキシ層**: `/api/graphql`でセッション情報をHMAC-SHA256署名付きヘッダーに変換
3. **バックエンド**: NestJSでヘッダー署名を検証し、ユーザー情報を復元

#### 裏口ログイン（プレビュー環境用）

- **用途**: Vercelプレビュー環境での検証用
- **有効化**: 環境変数`ENABLE_BACKDOOR_LOGIN=true`で有効化
- **認証方式**: CredentialsProvider（JWT戦略）
- **本番環境**: 必ず無効化すること（`ENABLE_BACKDOOR_LOGIN=false`）

### データベースアクセス

- **フロントエンド**: Prisma ORM → MySQL
- **バックエンド**: Drizzle ORM → 同一MySQL（スキーマ同期が必要）

### API アーキテクチャ（DDD）

バックエンドAPIはDDD（ドメイン駆動設計）のレイヤードアーキテクチャを採用：

```
apps/api/src/
├── domain/           # ドメイン層（ビジネスロジックの中核）
│   ├── models/       # エンティティ（private constructor + factory methods）
│   ├── repositories/ # リポジトリインターフェース（abstract class）
│   └── types/        # ドメイン型定義
├── application/      # アプリケーション層（ユースケース）
│   └── usecases/     # 各機能のユースケース
├── infrastructure/   # インフラ層（外部システムとの接続）
│   ├── auth/         # 認証（Guards, Strategies, Decorators）
│   ├── database/     # Drizzle設定・スキーマ
│   └── repositories/ # リポジトリ実装
├── presentation/     # プレゼンテーション層（GraphQL API）
│   ├── resolvers/    # GraphQLリゾルバー
│   ├── dto/          # Input/Response型（@InputType, @ObjectType）
│   └── modules/      # NestJSモジュール
└── shared/           # 横断的関心事
    └── constants/    # 定数（DIトークンなど）
```

**レイヤー間の依存ルール:**

- domain → 他層に依存しない
- application → domain のみ依存
- infrastructure → domain に依存（リポジトリ実装）
- presentation → application, domain に依存

### 検索エンジン

- **MeiliSearch日本語版**（`getmeili/meilisearch:prototype-japanese-6`）を使用
- Dockerfileで専用イメージをビルド

## 開発コマンド

### 基本操作

```bash
# 開発環境起動（全サービス）
pnpm dev

# 個別サービス起動
pnpm --filter web dev      # フロントエンド (http://localhost:3000)
pnpm --filter api dev      # API (http://localhost:4000/graphql)

# ビルド
pnpm build                 # 全体
pnpm --filter web build
pnpm --filter api build
```

### データベース操作

```bash
# Prisma (フロントエンド)
pnpm --filter web prisma generate    # クライアント生成
pnpm --filter web db:push            # スキーマ反映
pnpm --filter web db:studio          # Prisma Studio起動

# Drizzle (バックエンド)
pnpm --filter api db:push            # スキーマ反映
pnpm --filter api db:generate        # マイグレーション生成
```

### テスト

```bash
# フロントエンド
pnpm --filter web test              # 単体テスト実行
pnpm --filter web test:w            # ウォッチモード
pnpm --filter web test:c            # カバレッジ

# バックエンド
pnpm --filter api test              # 単体テスト
pnpm --filter api test:watch        # ウォッチモード
pnpm --filter api test:cov          # カバレッジ
pnpm --filter api test:e2e          # E2Eテスト
```

### リント・フォーマット

```bash
pnpm lint                           # 全体のリント
pnpm lint:fix                       # 自動修正
pnpm format                         # Prettierフォーマット
pnpm check-types                    # 型チェック
```

### その他の開発コマンド

```bash
# GraphQLコード生成（型定義）
pnpm --filter web codegen

# バンドルサイズ分析
pnpm --filter web analyze

# メールテンプレート開発
pnpm --filter web email

# Lighthouse実行
pnpm --filter web lighthouse
```

## 重要ファイル・ディレクトリ

### 認証関連

- `apps/web/src/pages/api/graphql.ts` - GraphQLプロキシ（署名生成）
- `apps/web/src/pages/api/auth/[...nextauth].ts` - NextAuth設定
- `apps/web/src/libs/auth/` - 認証ユーティリティ
- `apps/api/src/infrastructure/auth/` - NestJS認証モジュール（署名検証）

### GraphQL

- `apps/web/src/libs/apollo/` - Apollo Client設定
- `apps/api/src/schema.gql` - GraphQLスキーマ（自動生成）
- `apps/api/src/presentation/resolvers/` - GraphQLリゾルバー

### データベース

- `apps/web/prisma/schema.prisma` - Prismaスキーマ定義
- `apps/api/src/infrastructure/database/schema/` - Drizzleスキーマ定義

### 検索

- `apps/web/src/libs/meilisearch/` - MeiliSearch統合
- `docker/meilisearch/` - 日本語対応MeiliSearch設定

## 開発時の注意事項

### GraphQL開発

1. NestJSでリゾルバー変更後、スキーマが自動生成される
2. フロントエンドで`pnpm --filter web codegen`実行で型を生成
3. プロキシ経由（`/api/graphql`）でのみAPIアクセス可能

### データベーススキーマ変更

1. Prismaスキーマを編集
2. `pnpm --filter web db:push`でDBに反映
3. Drizzleスキーマも手動で同期（重要）
4. `pnpm --filter api db:push`でバックエンドも更新

### MeiliSearch

- 日本語プロトタイプビルド使用のため、通常版との互換性なし
- インデックスリセット時は`docker-compose restart meilisearch`

### デプロイ（GitHub Actions）

- masterブランチプッシュで自動デプロイ（Google Cloud Run）
- `apps/api`配下の変更でAPIデプロイトリガー
- 環境変数はGitHub Secretsで管理

## サンドボックス環境での開発

### Playwright MCPが使用できない場合のスクリーンショット撮影

```bash
cat > /tmp/screenshot.mjs << 'EOF'
import { chromium } from '/root/.npm/_npx/b6ca8615f3c4955e/node_modules/playwright/index.mjs';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--single-process', '--no-zygote']
});
const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
await page.screenshot({ path: '/home/user/kidoku/screenshot.png', fullPage: true });
console.log('Screenshot saved');
await browser.close();
EOF

node /tmp/screenshot.mjs
```

### 注意事項

- **外部サービスへの接続制限**: Google Fonts、Prisma Accelerate等への接続がブロックされる場合があります
- **ページ表示エラー**: DB接続エラーはサンドボックスのネットワーク制限が原因の場合があり、コード自体の問題ではありません
- **`pnpm dev`の起動確認**: TypeScriptコンパイルエラー0件、Next.js/NestJSの起動成功メッセージで判断してください

## トラブルシューティング

### 型エラー

```bash
# GraphQL型の再生成
pnpm --filter web codegen

# Prismaクライアント再生成
cd apps/web && npx prisma generate
# サンドボックス環境では PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 を付与
```

### 認証エラー

- NEXTAUTH_SECRETがフロントエンド・バックエンド間で一致しているか確認
- タイムスタンプのずれ（30秒以上）でも認証失敗
- 裏口ログイン使用時：`NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true`、`BACKDOOR_USER_EMAIL`が正しく設定されているか確認
- 裏口ログイン有効時はJWT戦略に切り替わる（sessionテーブルは使用されない）

### Docker関連

```bash
# 全コンテナ再起動
docker-compose down && docker-compose up -d

# MeiliSearchデータリセット
rm -rf docker/meilisearch/data/meilisearch
docker-compose up -d meilisearch
```