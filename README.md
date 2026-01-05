# kidoku

読書記録・分析アプリケーション - AIによる読書傾向分析機能付き

https://kidoku.net/

<img width="1247" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/d2b88d99-670b-468e-8fd3-27f6ecb50430">
<img width="1059" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/52735f61-825a-44ed-88dd-12a6153a7eca">

## 機能

- 本の検索と登録（バーコードスキャン、タイトル検索）
- 年別シートでの読書記録管理
- AIによる読書傾向分析（Cohere）
- 統計データ（月別読書数、カテゴリ別内訳）
- MeiliSearchによる高速全文検索

## アーキテクチャ

| 項目 | 技術 |
|------|------|
| モノレポ管理 | Turborepo + pnpm workspaces |
| フロントエンド | Next.js 14 + React 18 + TypeScript |
| バックエンド | NestJS 11 + GraphQL（DDD構成） |
| データベース | MySQL + Prisma / Drizzle ORM |
| 認証 | NextAuth.js (Google OAuth) |
| 検索 | MeiliSearch (日本語対応版) |
| AI | Cohere |
| 決済 | Stripe |

## プロジェクト構成

```
kidoku/
├── apps/
│   ├── web/          # Next.jsフロントエンド
│   └── api/          # NestJS GraphQL API
├── docker/           # Docker設定
└── .github/          # GitHub Actions
```

詳細は各アプリのREADMEを参照：
- [apps/web/README.md](./apps/web/README.md) - フロントエンド
- [apps/api/DEPLOYMENT.md](./apps/api/DEPLOYMENT.md) - APIデプロイ

## 環境構築

### 前提条件

- Node.js 22以上
- pnpm 10.5.2以上
- Docker & Docker Compose

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Dockerサービスの起動
docker-compose up -d

# データベースのセットアップ
pnpm --filter web db:push
pnpm --filter web prisma generate
pnpm --filter api db:push

# 開発サーバーの起動
pnpm dev
```

### 検索環境(meilisearch)構築

```bash
docker-compose up --build

# meilisearchが構築できていることを確認
# 初回はモーダルに.envに記載のMEILI_MASTER_KEYを入力
open http://localhost:7700

# meilisearchにドキュメント登録
curl -XPOST -H "Authorization: Bearer ${ADMIN_AUTH_TOKEN}" http://localhost:3000/api/batch/meilisearch
# {"result":true}
```

### アクセスURL

- **Webアプリ**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **MeiliSearch**: http://localhost:7700

## 開発コマンド

```bash
pnpm dev              # 全サービス起動
pnpm build            # ビルド
pnpm lint             # リント
pnpm format           # フォーマット
pnpm check-types      # 型チェック
```

## 貢献

1. フォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. コミット: `git commit -m 'Add amazing feature'`
4. プッシュ: `git push origin feature/amazing-feature`
5. Pull Request作成

## ライセンス

MIT
