# kidoku

読書記録・分析アプリケーション - AIによる読書傾向分析機能付き

https://kidoku.net/

<img width="1247" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/d2b88d99-670b-468e-8fd3-27f6ecb50430">
<img width="1059" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/52735f61-825a-44ed-88dd-12a6153a7eca">

## プロジェクト概要

Kidokuは読書体験を向上させるためのWebアプリケーションです。本の記録・管理だけでなく、AIを活用した読書傾向の分析や、豊富な検索機能を提供します。年別・月別の読書統計やカテゴリ分析により、読書習慣の可視化をサポートします。

### アーキテクチャ

- **フロントエンド**: Next.js 14 (Pages Router) + React 18 (TypeScript 4.5.4)
- **バックエンド**: NestJS 11 + GraphQL (TypeScript 5.7.3)
- **データベース**: MySQL + Prisma (フロントエンド) / Drizzle ORM (バックエンド)
- **認証**: NextAuth.js + JWT
- **検索エンジン**: MeiliSearch
- **AI機能**: Cohere
- **メール送信**: Resend
- **決済**: Stripe
- **ストレージ**: Vercel Blob + Vercel KV
- **監視**: Prometheus + Grafana

## 機能

### 📚 読書記録管理

- **本の検索と登録**: バーコードスキャン、タイトル検索、ユーザー本棚検索
- **年別シート管理**: 2022年、2023年など年ごとの読書記録管理
- **読書メモ**: 本ごとの感想・メモ機能
- **進捗管理**: 読書状況の管理（読書中、読了、積読など）

### 📊 分析機能

- **AIによる読書傾向分析**: Cohereを活用した読書パターン分析
- **統計データ**: 月別読書数、カテゴリ別内訳、年間統計
- **可視化**: グラフ・チャートによる読書データの視覚化
- **年間ベスト本**: 年間読書ランキング機能

### 🔧 その他の機能

- **Software Design誌対応**: 技術評論社の表紙画像を自動取得
- **アプリケーション監視**: Prometheus + Grafanaによるメトリクス収集・可視化

### 🔍 検索・発見

- **高速検索**: MeiliSearchによる本の高速全文検索
- **カテゴリ検索**: ジャンル・カテゴリ別の本の発見
- **テンプレート機能**: おすすめ本のテンプレート提供

### 👥 社会的機能

- **ユーザー認証**: Google認証によるセキュアなログイン
- **プロフィール管理**: ユーザープロフィール・読書設定管理

## 技術スタック

### フロントエンド

- **Next.js** (v14.1.0) - React フレームワーク (Pages Router)
- **React** (v18.2.0) - UIライブラリ
- **TypeScript** (v4.5.4) - 型安全性
- **Tailwind CSS** (v3.2.2) - スタイリング
- **Framer Motion** - アニメーション
- **Jotai** (v2.6.5) - 状態管理
- **Apollo Client** (v3.13.8) - GraphQLクライアント
- **NextAuth.js** (v4.23.1) - 認証
- **Prisma** (v5.2.0) - ORM
- **React Email** - メールテンプレート

### バックエンド

- **NestJS** (v11.0.1) - Node.jsフレームワーク
- **GraphQL** - API仕様（Apollo Server v4.12.0）
- **TypeScript** (v5.7.3) - 型安全性
- **Drizzle ORM** (v0.43.1) - データベースORM
- **MySQL** - データベース
- **JWT** - 認証トークン（@nestjs/jwt v11.0.0）

### インフラ・外部サービス

- **MeiliSearch** (v0.35.0) - 検索エンジン
- **Cohere** (v7.9.5) - AI分析
- **Resend** (v1.1.0) - メール配信
- **Stripe** (v14.5.0) - 決済処理
- **Vercel Blob** - ファイルストレージ
- **Docker** - コンテナ化
- **Prometheus** - メトリクス収集
- **Grafana** - メトリクス可視化

## プロジェクト構成

このプロジェクトは**Turborepo**を使用したモノレポ構成です。

```
kidoku/
├── apps/
│   ├── web/                    # Next.jsフロントエンドアプリケーション
│   │   ├── src/
│   │   │   ├── pages/         # Pages Router
│   │   │   ├── components/    # Reactコンポーネント
│   │   │   ├── features/      # 機能別モジュール
│   │   │   ├── graphql/       # GraphQLクエリ・ミューテーション
│   │   │   ├── hooks/         # カスタムフック
│   │   │   ├── lib/           # ユーティリティ
│   │   │   └── stores/        # Jotaiストア
│   │   └── prisma/            # Prismaスキーマ
│   │
│   └── api/                    # NestJS GraphQLバックエンドAPI
│       ├── src/
│       │   ├── modules/        # 機能モジュール
│       │   │   ├── sheets/     # シート管理
│       │   │   ├── comments/   # コメント機能
│       │   │   ├── software-design/ # Software Design誌機能
│       │   │   └── metrics/    # メトリクス
│       │   └── common/         # 共通機能
│       └── drizzle/            # Drizzleスキーマ
│
├── docker/                     # Docker設定ファイル
│   ├── meilisearch/           # MeiliSearch設定
│   ├── mysql/                 # MySQL設定
│   ├── prometheus/            # Prometheus設定
│   └── grafana/               # Grafanaダッシュボード
│
├── .github/
│   └── workflows/             # GitHub Actions
│       └── deploy-api.yml     # APIデプロイ
│
├── docker-compose.yml
├── turbo.json                 # Turbo設定
└── package.json               # ルートpackage.json
```

### apps/web (フロントエンド)

- **フレームワーク**: Next.js 14 (Pages Router)
- **言語**: TypeScript 4.5.4
- **UI**: Tailwind CSS + Framer Motion
- **状態管理**: Jotai
- **データ取得**: Apollo Client (GraphQL)
- **認証**: NextAuth.js
- **ORM**: Prisma
- **メトリクス**: `/api/metrics`エンドポイント

### apps/api (バックエンド)

- **フレームワーク**: NestJS
- **API**: GraphQL (Apollo Server)
- **言語**: TypeScript 5.7.3
- **ORM**: Drizzle ORM
- **データベース**: MySQL
- **認証**: JWT + Passport
- **メトリクス**: `/metrics`エンドポイント

### 主要なスクリプト

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
pnpm lint:fix             # リントエラーの自動修正
pnpm format               # コードフォーマット
pnpm check-types          # 型チェック

# データベース操作
pnpm --filter web prisma:generate  # Prismaクライアント生成
pnpm --filter web prisma:push      # Prismaスキーマの反映
pnpm --filter api db:push          # Drizzleスキーマの反映

# その他
pnpm --filter web analyze      # バンドルサイズ分析
pnpm --filter web lighthouse   # Lighthouse実行
pnpm --filter web email        # メールテンプレート開発
```

## 環境構築

### 前提条件

- Node.js 22以上（推奨: v22、.nvmrc参照）
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
cp apps/web/.env.example apps/web/.env.local

# APIアプリケーション用の環境変数（.env.exampleを作成する必要があります）
cp apps/api/.env.example apps/api/.env
```

#### 必須の環境変数（apps/web/.env.local）

```env
# 基本設定
NEXT_PUBLIC_HOST=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXTAUTH_SECRET= # openssl rand -base64 32で生成

# Google OAuth（必須）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# データベース（必須）
DATABASE_URL=mysql://root:password@localhost:3306/kidoku

# MeiliSearch（必須）
MEILI_HOST=http://localhost:7700
MEILI_HTTP_ADDR=0.0.0.0:7700
MEILI_MASTER_KEY=YourMasterKey

# その他のサービス
RESEND_API_KEY=           # メール送信
STRIPE_SECRET_KEY=        # 決済
STRIPE_PUBLISHABLE_KEY=   # 決済（公開鍵）
COHERE_API_KEY=          # AI分析
PUSHER_APP_ID=           # リアルタイム通信
PUSHER_KEY=              # リアルタイム通信
PUSHER_SECRET=           # リアルタイム通信
PUSHER_CLUSTER=          # リアルタイム通信
ADMIN_AUTH_TOKEN=        # 管理者認証トークン
```

#### APIの環境変数（apps/api/.env）

```env
DB_USER=root
DB_PASS=password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kidoku
```

### 4. インフラストラクチャの起動

```bash
# MeiliSearchとMySQLをDockerで起動
docker-compose up -d
```

### 5. データベースのセットアップ

```bash
# Prismaマイグレーション（Webアプリ）
pnpm --filter web prisma:push
pnpm --filter web prisma:generate

# Drizzleマイグレーション（API）
pnpm --filter api db:push
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
- **GraphQL API**: http://localhost:4000/graphql
- **MeiliSearch Dashboard**: http://localhost:7700
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:13000 (初期認証: admin/admin)

## 監視システム（Prometheus + Grafana）

アプリケーションとインフラの監視が設定済みです。

### アクセスURL

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:13000 (初期認証: admin/admin)

### メトリクスエンドポイント

- **フロントエンド**: http://localhost:3000/api/metrics
- **バックエンド**: http://localhost:4000/metrics

### カスタムメトリクス

```
- http_requests_total: HTTPリクエスト数
- http_request_duration_seconds: リクエスト処理時間
- kidoku_active_users: アクティブユーザー数
- kidoku_books_registered_total: 登録された本の総数
- kidoku_ai_analysis_requests_total: AI分析リクエスト数
```

### Grafanaダッシュボード

Grafanaにログイン後、プリセットされた`kidoku-dashboard.json`を使用してアプリケーションメトリクスを視覚化できます。

## CI/CD

### GitHub Actions

APIの自動デプロイが設定されています：

- **トリガー**: master/mainブランチへのプッシュ、またはapi配下の変更
- **デプロイ先**: Google Cloud Run
- **設定**: メモリ256Mi、CPU 1、インスタンス0-2

## 特殊機能

### Software Design誌対応

技術評論社の「Software Design」誌を自動判別し、表紙画像を取得します：

- ISBNが`9784297`で始まる場合
- タイトルに"Software Design"を含む場合
- 最新号情報の自動取得

### バーコードスキャン連携

モバイルアプリからのバーコードスキャン結果がPusher経由でリアルタイムに反映されます。

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

# ポート4000が使用中の場合、プロセスを終了
lsof -ti:4000 | xargs kill -9
```

#### TypeScriptバージョンの不一致

フロントエンド（TypeScript 4.5.4）とバックエンド（TypeScript 5.7.3）でバージョンが異なるため、共通コードを書く際は注意が必要です。

#### 監視システムが起動しない場合

```bash
# Dockerコンテナのログ確認
docker-compose logs prometheus
docker-compose logs grafana

# コンテナの再起動
docker-compose restart prometheus grafana
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

### 注意事項

- フロントエンドはPages Routerを使用（App Routerではありません）
- データベースアクセスはフロントエンドがPrisma、バックエンドがDrizzle ORMを使用
- TypeScriptバージョンがフロントエンドとバックエンドで異なる

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

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
