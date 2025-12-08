# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Kidoku（きどく）は、読書記録・分析アプリケーションです。バーコードスキャンによる本の登録、AIによる読書傾向分析、年別シート管理などの機能を提供します。

## 技術スタック

### フロントエンド (apps/web)
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS（スタイリング）
- Jotai（状態管理）
- Apollo Client（GraphQL）
- NextAuth.js（認証）
- Prisma（ORM）

### バックエンド (apps/api)
- NestJS + TypeScript
- GraphQL (Apollo Server)
- Drizzle ORM
- MySQL
- JWT認証

### 外部サービス
- MeiliSearch（検索エンジン）
- OpenAI GPT / Cohere（AI分析）
- Stripe（決済）
- Vercel Blob（ストレージ）

## 開発環境セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Dockerサービスの起動
docker-compose up -d

# 開発サーバーの起動
pnpm dev
```

## 主要な開発コマンド

```bash
# 開発
pnpm dev                    # 全サービスの起動
pnpm --filter web dev      # フロントエンドのみ
pnpm --filter api dev      # APIのみ

# ビルド
pnpm build                 # 全体のビルド
pnpm --filter web build    # フロントエンドのビルド
pnpm --filter api build    # APIのビルド

# テスト
pnpm --filter web test     # フロントエンドのテスト
pnpm --filter api test     # APIのテスト
pnpm --filter api test:e2e # APIのE2Eテスト

# リント・フォーマット
pnpm lint                  # 全体のリント
pnpm format               # コードフォーマット

# データベース操作
pnpm --filter web db:push  # Prismaスキーマの反映
pnpm --filter web db:studio # Prisma Studioの起動

# GraphQL
pnpm --filter web codegen  # GraphQLコード生成
```

## プロジェクト構成

```
kidoku/
├── apps/
│   ├── web/                    # Next.jsフロントエンド
│   │   ├── src/
│   │   │   ├── app/           # App Router
│   │   │   ├── components/    # Reactコンポーネント
│   │   │   ├── graphql/       # GraphQLクエリ・ミューテーション
│   │   │   ├── hooks/         # カスタムフック
│   │   │   ├── lib/          # ユーティリティ
│   │   │   └── stores/       # Jotaiストア
│   │   └── prisma/           # Prismaスキーマ
│   │
│   └── api/                   # NestJS API
│       ├── src/
│       │   ├── modules/      # 機能モジュール
│       │   ├── common/       # 共通機能
│       │   └── schema/       # GraphQLスキーマ
│       └── drizzle/          # Drizzleスキーマ
│
├── docker/                    # Docker設定
│   ├── meilisearch/          # 検索エンジン
│   └── mysql/                # データベース
│
└── turbo.json                # Turborepo設定
```

## 主要なデータフロー

1. **本の登録**: バーコードスキャン → Google Books API → データベース保存
2. **AI分析**: 読書データ収集 → OpenAI/Cohere API → 分析結果保存・表示
3. **検索**: MeiliSearchインデックス更新 → 高速全文検索
4. **リアルタイム更新**: データ変更 → Pusher → 全クライアント更新

## 開発時の注意事項

### GraphQL開発
- スキーマ変更後は必ず `pnpm --filter web codegen` を実行
- Resolverは対応するモジュールディレクトリに配置

### データベース
- フロントエンド: Prismaを使用（`apps/web/prisma/schema.prisma`）
- バックエンド: Drizzle ORMを使用（`apps/api/drizzle`）
- スキーマ変更時は両方の更新が必要

### 環境変数
- 必須の環境変数はREADMEに記載
- APIキーは絶対にコミットしない
- ローカル開発では`.env.local`を使用

### テスト
- 新機能追加時は必ずテストを書く
- フロントエンド: Jest + React Testing Library
- バックエンド: Jest（単体テスト）+ Supertest（E2E）

## トラブルシューティング

### MeiliSearchエラー
```bash
# インデックスのリセット
docker-compose restart meilisearch
```

### データベース接続エラー
```bash
# MySQLコンテナの再起動
docker-compose restart mysql
# Prismaクライアントの再生成
pnpm --filter web prisma generate
```

### 型エラー
```bash
# GraphQL型の再生成
pnpm --filter web codegen
# TypeScriptの型チェック
pnpm --filter web type-check
```