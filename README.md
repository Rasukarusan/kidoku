# kidoku

読書記録・分析アプリケーション - AIによる読書傾向分析機能付き

https://kidoku.net/

<img width="1247" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/d2b88d99-670b-468e-8fd3-27f6ecb50430">
<img width="1059" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/52735f61-825a-44ed-88dd-12a6153a7eca">

## プロジェクト概要

Kidokuは読書体験を向上させるためのWebアプリケーションです。本の記録・管理だけでなく、AIを活用した読書傾向の分析や、豊富な検索機能を提供します。年別・月別の読書統計やカテゴリ分析により、読書習慣の可視化をサポートします。

### アーキテクチャ

- **フロントエンド**: Next.js + React (TypeScript)
- **バックエンド**: NestJS + GraphQL
- **データベース**: MySQL/TiDB + Prisma/Drizzle ORM
- **認証**: NextAuth.js
- **検索エンジン**: MeiliSearch
- **AI機能**: OpenAI GPT + Cohere
- **リアルタイム通信**: Pusher
- **メール送信**: Resend
- **決済**: Stripe
- **ストレージ**: Vercel Blob

## 機能

### 📚 読書記録管理

- **本の検索と登録**: バーコードスキャン、タイトル検索、ユーザー本棚検索
- **年別シート管理**: 2022年、2023年など年ごとの読書記録管理
- **読書メモ**: 本ごとの感想・メモ機能
- **進捗管理**: 読書状況の管理（読書中、読了、積読など）

### 📊 分析機能

- **AIによる読書傾向分析**: OpenAI/Cohereを活用した読書パターン分析
- **統計データ**: 月別読書数、カテゴリ別内訳、年間統計
- **可視化**: グラフ・チャートによる読書データの視覚化
- **年間ベスト本**: 年間読書ランキング機能

### 🔍 検索・発見

- **高速検索**: MeiliSearchによる本の高速全文検索
- **カテゴリ検索**: ジャンル・カテゴリ別の本の発見
- **テンプレート機能**: おすすめ本のテンプレート提供

### 👥 社会的機能

- **ユーザー認証**: Google認証によるセキュアなログイン
- **プロフィール管理**: ユーザープロフィール・読書設定管理
- **リアルタイム更新**: Pusherによるリアルタイム機能

## 技術スタック

### フロントエンド

- **Next.js** (v14) - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **Jotai** - 状態管理
- **Apollo Client** - GraphQLクライアント
- **React Email** - メールテンプレート

### バックエンド

- **NestJS** - Node.jsフレームワーク
- **GraphQL** - API仕様
- **Drizzle ORM** - データベースORM
- **MySQL/TiDB** - データベース
- **JWT** - 認証トークン

### インフラ・外部サービス

- **MeiliSearch** - 検索エンジン
- **OpenAI GPT** - AI分析
- **Cohere** - AI言語モデル
- **Pusher** - リアルタイム通信
- **Resend** - メール配信
- **Stripe** - 決済処理
- **Vercel Blob** - ファイルストレージ
- **Docker** - コンテナ化

## プロジェクト構成

このプロジェクトは**Turborepo**を使用したモノレポ構成です。

```
kidoku/
├── apps/
│   ├── web/          # Next.jsフロントエンドアプリケーション
│   └── api/          # NestJS GraphQLバックエンドAPI
├── docker/           # Docker設定ファイル
│   ├── meilisearch/  # MeiliSearch設定
│   └── mysql/        # MySQL設定
├── docker-compose.yml
├── turbo.json        # Turbo設定
└── package.json      # ルートpackage.json
```

### apps/web (フロントエンド)

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **状態管理**: Jotai
- **データ取得**: Apollo Client (GraphQL)
- **認証**: NextAuth.js
- **ORM**: Prisma

### apps/api (バックエンド)

- **フレームワーク**: NestJS
- **API**: GraphQL (Apollo Server)
- **言語**: TypeScript
- **ORM**: Drizzle ORM
- **データベース**: MySQL
- **認証**: JWT + Passport

### 主要なスクリプト

```bash
# 全アプリケーションの開発開始
pnpm dev

# 全アプリケーションのビルド
pnpm build

# リンター実行
pnpm lint

# 型チェック
pnpm check-types
```

## 環境構築

### 前提条件

- Node.js 23以上
- pnpm 10.5.2以上
- Docker & Docker Compose

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/kidoku.git
cd kidoku
```

### 2. 依存関係のインストール

```bash
# ルートでの一括インストール
pnpm install
```

### 3. 環境変数の設定

```bash
# Webアプリケーション用の環境変数
cp apps/web/.env.example apps/web/.env

# APIアプリケーション用の環境変数
cp apps/api/.env.example apps/api/.env
```

必要な環境変数を設定してください：

- データベース接続情報
- NextAuth設定（Google OAuth）
- MeiliSearch設定
- AI API キー（OpenAI、Cohere）
- Pusher設定
- Stripe設定
- Resend設定

### 4. インフラストラクチャの起動

```bash
# MeiliSearchとMySQLをDockerで起動
docker-compose up -d
```

### 5. データベースのセットアップ

```bash
# Prismaマイグレーション（Webアプリ）
cd apps/web
pnpm prisma db push
pnpm prisma generate

# Drizzleマイグレーション（API）
cd ../api
pnpm db:push
```

### 6. MeiliSearchの初期設定

```bash
# MeiliSearchが起動していることを確認
open http://localhost:7700

# 初回アクセス時は.envのMEILI_MASTER_KEYを入力
# 検索インデックスの作成
curl -XPOST -H "Authorization: Bearer ${ADMIN_AUTH_TOKEN}" http://localhost:3000/api/batch/meilisearch
```

### 7. アプリケーションの起動

```bash
# ルートディレクトリから全サービスを起動
pnpm dev
```

以下のURLでアクセス可能です：

- **Webアプリ**: http://localhost:3000
- **GraphQL API**: http://localhost:3001/graphql
- **MeiliSearch Dashboard**: http://localhost:7700

### 開発用コマンド

```bash
# 個別にアプリを起動
pnpm --filter web dev          # Webアプリのみ
pnpm --filter api dev          # APIのみ

# テスト実行
pnpm --filter web test         # Webアプリのテスト
pnpm --filter api test         # APIのテスト

# リンター・フォーマッター
pnpm lint                      # 全プロジェクトのリント
pnpm format                    # コードフォーマット

# ビルド
pnpm build                     # 全プロジェクトのビルド
```

## トラブルシューティング

### MeiliSearchの起動に失敗した場合

`docker-compose up`で下記エラーが出た場合、`docker/meilisearch/data/meilisearch`を削除してから再度`docker-compose up`すると起動できます。

```
Error: Meilisearch (v1.4.2) failed to infer the version of the database.
To update Meilisearch please follow our guide on https://www.meilisearch.com/docs/learn/update_and_migration/updating.
```

### よくある問題と解決方法

#### 依存関係のインストールエラー

```bash
# pnpmのキャッシュをクリア
pnpm store prune

# node_modulesを削除して再インストール
rm -rf node_modules apps/*/node_modules
pnpm install
```

#### データベース接続エラー

```bash
# Dockerサービスの再起動
docker-compose down
docker-compose up -d

# データベースの状態確認
docker-compose logs mysql
```

#### GraphQL API接続エラー

```bash
# APIサーバーのログ確認
pnpm --filter api dev

# ポート3001が使用中の場合、プロセスを終了
lsof -ti:3001 | xargs kill -9
```

## 貢献

### 開発フロー

1. このリポジトリをフォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. ブランチにプッシュ: `git push origin feature/amazing-feature`
5. Pull Requestを作成

### コーディング規約

- **TypeScript**: 型定義を必須とし、`any`の使用を避ける
- **ESLint**: プロジェクトのESLint設定に従う
- **Prettier**: コードフォーマットは自動で適用
- **コミットメッセージ**: Conventional Commitsに従う

### テスト

新機能やバグ修正には適切なテストを追加してください：

```bash
# Web アプリのテスト
pnpm --filter web test

# API のテスト
pnpm --filter api test

# テストカバレッジ
pnpm --filter web test:c
pnpm --filter api test:cov
```

### 環境変数の管理

機密情報を含む環境変数は絶対にコミットしないでください。`.env.example`ファイルに必要な環境変数のテンプレートを記載してください。
