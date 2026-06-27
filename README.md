<div align="center">

# Kidoku

**あなたのための読書記録 & 分析アプリ**

バーコードスキャン、全文検索、美しい統計を備えた、AIによる読書傾向の分析。

[デモ](https://kidoku.net/) | [コントリビュート](./CONTRIBUTING.md) | [ドキュメント](./docs/)

[![CI](https://github.com/Rasukarusan/kidoku/actions/workflows/ci.yml/badge.svg)](https://github.com/Rasukarusan/kidoku/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

<img width="1247" alt="Kidoku - 読書記録管理" src="https://github.com/Rasukarusan/kidoku/assets/17779386/d2b88d99-670b-468e-8fd3-27f6ecb50430">
<img width="1059" alt="Kidoku - 読書統計" src="https://github.com/Rasukarusan/kidoku/assets/17779386/52735f61-825a-44ed-88dd-12a6153a7eca">

---

## 機能

- **本の登録** - タイトル検索またはバーコードスキャンで、本をすぐに追加
- **年別読書シート** - 読書履歴を年ごとにビジュアルなカードで整理
- **AI読書分析** - OpenAI による分析であなたの読書傾向を発見
- **読書統計** - 月別の読書数、カテゴリ別の内訳、トレンドを可視化
- **全文検索** - MeiliSearch による高速な日本語全文検索

## 技術スタック

| レイヤー | 技術 |
|-------|------------|
| モノレポ | Turborepo + pnpm workspaces |
| フロントエンド | Next.js 14, React 18, TypeScript, Tailwind CSS |
| バックエンド | NestJS 11, GraphQL, DDDアーキテクチャ |
| データベース | MySQL 9.3 + Prisma ORM |
| 認証 | NextAuth.js (Google OAuth) |
| 検索 | MeiliSearch (日本語最適化ビルド) |
| AI | OpenAI |
| 決済 | Stripe |

## プロジェクト構成

```
kidoku/
├── apps/
│   ├── web/          # Next.js フロントエンド
│   └── api/          # NestJS GraphQL API (DDD)
├── packages/
│   └── eslint-config # 共通 ESLint 設定
├── docker/           # MeiliSearch & MySQL コンテナ
├── docs/             # アーキテクチャ・デプロイ関連ドキュメント
└── scripts/          # 開発自動化スクリプト
```

## はじめに

### 前提条件

- Node.js >= 22
- pnpm >= 10.5.2
- Docker & Docker Compose

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# Docker サービス起動 (MySQL, MeiliSearch)
docker-compose up -d

# データベースのセットアップ
pnpm --filter web db:push
pnpm --filter web prisma generate
pnpm --filter api db:push

# 全ての開発サーバーを起動
pnpm dev
```

### アクセスURL

| サービス | URL |
|---------|-----|
| Webアプリ | http://localhost:3000 |
| GraphQL API | http://localhost:4000/graphql |
| MeiliSearch | http://localhost:7700 |

### 検索のセットアップ (MeiliSearch)

```bash
docker-compose up --build

# MeiliSearch にドキュメントを登録
curl -XPOST -H "Authorization: Bearer ${ADMIN_AUTH_TOKEN}" \
  http://localhost:3000/api/batch/meilisearch
```

## 開発

```bash
pnpm dev              # 全サービス起動
pnpm build            # 全パッケージのビルド
pnpm lint             # リント実行
pnpm lint:fix         # リントの自動修正
pnpm format           # Prettier でフォーマット
pnpm check-types      # 型チェック
pnpm validate         # lint + 型チェック + テストを一括実行
```

### テスト

```bash
# フロントエンド
pnpm --filter web test          # 単体テスト
pnpm --filter web test:c        # カバレッジ付き

# バックエンド
pnpm --filter api test          # 単体テスト
pnpm --filter api test:e2e      # E2Eテスト
```

## アーキテクチャ

バックエンドAPIは **ドメイン駆動設計 (DDD)** によるレイヤードアーキテクチャを採用しています。

```
apps/api/src/
├── domain/           # ビジネスロジックの中核 (エンティティ、リポジトリインターフェース)
├── application/      # ユースケース
├── infrastructure/   # 外部連携 (DB, 認証)
├── presentation/     # GraphQLリゾルバー、DTO、モジュール
└── shared/           # 横断的関心事
```

**依存ルール**: `domain` は他層に依存しません。`application` は `domain` のみに依存します。`infrastructure` は `domain` のインターフェースを実装します。`presentation` は `application` を通して処理を実行します。

詳細なアーキテクチャドキュメントは以下を参照してください。
- [セキュリティ & 認証](./docs/SECURITY.md)
- [管理者API & バッチ処理](./docs/ADMIN_API.md)
- [デプロイガイド](./docs/DEPLOYMENT.md)

## コントリビュート

コントリビュートを歓迎します！ガイドラインは [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## ライセンス

[MIT](./LICENSE) - Naoto Tanaka
</content>
</invoke>
