# Kidoku Web

Next.jsフロントエンドアプリケーション

## 技術スタック

- **Next.js** (v14.1.0) - React フレームワーク (Pages Router & App Router)
- **React** (v18.2.0) - UIライブラリ
- **TypeScript** (v4.5.4) - 型安全性
- **Tailwind CSS** (v3.2.2) - スタイリング
- **Framer Motion** - アニメーション
- **Jotai** (v2.6.5) - 状態管理
- **Apollo Client** (v3.13.8) - GraphQLクライアント
- **NextAuth.js** (v4.23.1) - 認証
- **Prisma** (v5.2.0) - ORM
- **React Email** - メールテンプレート

## ディレクトリ構成

```
src/
├── app/           # App Router
├── components/    # 共通UIコンポーネント
│   ├── button/
│   ├── form/
│   ├── icon/
│   ├── input/
│   ├── label/
│   └── layout/
├── features/      # 機能別モジュール
│   ├── auth/      # 認証機能
│   ├── sheet/     # 読書シート
│   ├── search/    # 検索機能
│   ├── settings/  # 設定画面
│   ├── comments/  # コメント機能
│   ├── about/     # アバウトページ
│   ├── index/     # トップページ
│   ├── global/    # グローバル機能
│   ├── law/       # 特定商取引法
│   ├── terms/     # 利用規約
│   └── privacy/   # プライバシーポリシー
├── libs/          # 外部ライブラリ統合
│   ├── ai/        # AI機能（Cohere）
│   ├── apollo/    # GraphQLクライアント
│   ├── auth/      # NextAuth設定
│   ├── meilisearch/ # 検索エンジン
│   ├── prisma/    # ORM
│   ├── resend/    # メール送信
│   ├── sharp/     # 画像処理
│   └── stripe/    # 決済
├── pages/         # Pages Router (API Routes)
├── hooks/         # カスタムフック
├── store/         # Jotaiストア
├── types/         # 型定義
└── utils/         # ユーティリティ関数
```

## 開発コマンド

```bash
# 開発サーバー起動
pnpm --filter web dev

# ビルド
pnpm --filter web build

# テスト
pnpm --filter web test
pnpm --filter web test:w    # ウォッチモード
pnpm --filter web test:c    # カバレッジ

# リント
pnpm --filter web lint
pnpm --filter web lint:fix

# データベース
pnpm --filter web prisma generate  # Prismaクライアント生成
pnpm --filter web db:push          # スキーマ反映
pnpm --filter web db:studio        # Prisma Studio起動

# GraphQL
pnpm --filter web codegen          # 型生成

# その他
pnpm --filter web analyze          # バンドルサイズ分析
pnpm --filter web lighthouse       # Lighthouse実行
pnpm --filter web email            # メールテンプレート開発
```

## 環境変数

`.env.example`をコピーして`.env.local`を作成してください。

```bash
cp .env.example .env.local
```

### 必須

```env
NEXT_PUBLIC_HOST=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXTAUTH_SECRET=             # openssl rand -base64 32で生成
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=mysql://root:password@localhost:3306/kidoku
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=
```

### オプション

```env
RESEND_API_KEY=              # メール送信
STRIPE_SECRET_KEY=           # 決済
STRIPE_PUBLISHABLE_KEY=      # 決済（公開鍵）
COHERE_API_KEY=              # AI分析
ADMIN_AUTH_TOKEN=            # 管理者認証トークン
```

## トラブルシューティング

### 依存関係のインストールエラー

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Prisma関連エラー

```bash
pnpm --filter web prisma generate
```

### GraphQL型エラー

```bash
pnpm --filter web codegen
```

### MeiliSearchの起動に失敗した場合

`docker-compose up`で下記エラーが出た場合、`docker/meilisearch/data/meilisearch`を削除してから再度`docker-compose up`すると起動できます。

```
Error: Meilisearch (v1.4.2) failed to infer the version of the database.
To update Meilisearch please follow our guide on https://www.meilisearch.com/docs/learn/update_and_migration/updating.
```
