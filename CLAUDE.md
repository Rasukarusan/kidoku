# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要

CIでlint・型チェック・テストが自動実行されます。
ローカルで確認したい場合は `pnpm run validate`（lint + check-types + test 一括実行）を使ってください。

### MCP ブラウザツール非対応（Claude Code on the Web）

Playwright MCP（`@playwright/mcp@latest`）および Chrome DevTools MCP（`chrome-devtools-mcp`）は Claude Code on the Web では動作しない。**絶対に使用しないこと。**

- **Playwright MCP**: MCP サーバー内部の Playwright バージョン（alpha 版）と、インストール済み Chromium のビルド番号が不一致のため `Browser "chromium" is not installed` エラーになる
- **Chrome DevTools MCP**: Google Chrome がプリインストールされていないため `Could not find Google Chrome executable` エラーになる

**代替手段**: Playwright v1.50.0 をスクリプトとして直接実行する。詳細は [docs/SANDBOX_SETUP.md](./docs/SANDBOX_SETUP.md) の「Playwright スクリプトによるブラウザ操作」を参照。

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

- **フロントエンド**: `@prisma/client`（`apps/web/prisma/schema.prisma`）→ MySQL
- **バックエンド**: `@prisma/client`（`apps/api/prisma/schema.prisma`）→ 同一MySQL
- スキーマは `apps/web/prisma/schema.prisma` と `apps/api/prisma/schema.prisma` の2箇所に同じ内容が存在する。スキーマ変更時は両方を更新すること。

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
│   ├── database/     # Prisma設定・PrismaService
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

## コーディング規約

### ファイル命名

- ケバブケース: `create-book.ts`, `book.ts`, `injection-tokens.ts`
- 1ファイル1責務: 1つのクラス/モジュールに対して1ファイル
- テストファイル: `*.spec.ts`（API）, `*.test.ts`（Web）

### ドメインモデル

- private constructor + static factory methods パターンを使用
- `create()`: 新規作成（バリデーション込み）
- `fromDatabase()`: DB復元（バリデーションなし）
- フィールドはprivate、getterのみ公開
- 更新は `update()` メソッド経由

### リポジトリ

- `domain/repositories/` に abstract class として定義
- `infrastructure/repositories/` に実装
- NestJSモジュールで `{ provide: IXxxRepository, useClass: XxxRepository }` でDI

### ユースケース

- `application/usecases/{feature}/` に配置
- `@Injectable()` デコレータ必須
- コンストラクタでリポジトリを注入
- `execute()` メソッドに処理を実装

## 新しいGraphQLエンドポイント追加手順

例: `Tag` エンティティを追加する場合

1. **ドメインモデル作成**: `apps/api/src/domain/models/tag.ts` — private constructor + create() + fromDatabase() パターン
2. **リポジトリインターフェース作成**: `apps/api/src/domain/repositories/tag.ts` — abstract class ITagRepository
3. **リポジトリ実装**: `apps/api/src/infrastructure/repositories/tag.ts` — @Injectable() + ITagRepository を implements
4. **Prismaスキーマ追加**: `apps/api/prisma/schema.prisma` と `apps/web/prisma/schema.prisma` の両方にモデル定義を追加
5. **ユースケース作成**: `apps/api/src/application/usecases/tags/*.ts` — create-tag.ts, get-tags.ts 等
6. **DTO作成**: `apps/api/src/presentation/dto/tag.ts` — @InputType, @ObjectType
7. **リゾルバー作成**: `apps/api/src/presentation/resolvers/tag.ts` — @Resolver + @Query/@Mutation
8. **モジュール作成**: `apps/api/src/presentation/modules/tag.ts` — imports, providers, provide/useClass
9. **AppModuleに登録**: `apps/api/src/app.module.ts` の imports に TagModule 追加
10. **テスト作成**: ドメインモデル・ユースケースのユニットテストを作成
11. **Prismaクライアント再生成**: `pnpm --filter web prisma generate && pnpm --filter api prisma generate`
12. **フロントエンド型生成**: `pnpm --filter web codegen`

## Dual Prismaスキーマ同期ガイド

同一MySQLに対してWeb(`apps/web/prisma/schema.prisma`)とAPI(`apps/api/prisma/schema.prisma`)の2つのPrismaスキーマが存在するため、スキーマ変更時は**必ず両方を更新**する。

### 変更手順

1. `apps/web/prisma/schema.prisma` を編集
2. `apps/api/prisma/schema.prisma` にも同じ変更を反映
3. `pnpm --filter web db:push` でDBに反映
4. `pnpm --filter api db:push` でバックエンドも反映
5. `pnpm --filter web prisma generate` でWebのPrismaクライアント再生成
6. `pnpm --filter api prisma generate` でAPIのPrismaクライアント再生成

## 禁止事項・よくあるミス

### レイヤー依存ルール（厳守）

- ❌ domain/ から infrastructure/ や presentation/ をimportしない
- ❌ application/ から infrastructure/ や presentation/ をimportしない
- ❌ presentation/ から infrastructure/repositories/ を直接使わない（ユースケース経由）
- ✅ infrastructure/ → domain/ (リポジトリ実装がドメインモデルを使用)
- ✅ application/ → domain/ (ユースケースがドメインモデル・リポジトリを使用)
- ✅ presentation/ → application/ + domain/ (リゾルバーがユースケースを呼び出し)

### スキーマ変更

- ❌ Web側のPrismaスキーマだけ変更してAPI側を忘れる（またはその逆）
- ❌ スキーマ変更後に `db:push` を忘れる

### NestJS DI

- ❌ モジュールのprovidersに登録せずにクラスを@Injectする
- ❌ AppModuleにモジュールを追加し忘れる

### GraphQL

- ❌ リゾルバー変更後にフロントエンドの codegen を忘れる → `pnpm --filter web codegen` で型を再生成すること

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
# スキーマをDBに反映
pnpm --filter web db:push
pnpm --filter api db:push

# Prisma Studio起動
pnpm --filter web db:studio
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

### リント・フォーマット・一括検証

```bash
pnpm lint                           # 全体のリント
pnpm lint:fix                       # 自動修正
pnpm format                         # Prettierフォーマット
pnpm check-types                    # 型チェック
pnpm validate                       # lint + 型チェック + テストを一括実行
```

### UI確認（サンドボックス環境）

```bash
# 指定パスのスクリーンショットを撮影（裏口ログイン付き）
bash scripts/ui-check.sh /                              # トップページ
bash scripts/ui-check.sh /testuser/sheets/本棚           # 認証付きページ
bash scripts/ui-check.sh / /testuser/sheets/本棚         # 複数ページ一括
bash scripts/ui-check.sh --no-login /                   # ログインなしで撮影
# 出力先: /tmp/kidoku/screenshots/<ファイル名>.png
# 撮影後は Read ツールで画像を確認可能

# カスタムスクリプトモード（インタラクション操作が可能）
bash scripts/ui-check.sh --script /tmp/kidoku/my-test.mjs
# スクリプト例: export default async ({ page, screenshotDir }) => {
#   await page.goto('http://localhost:3000/');
#   await page.click('text=ログイン');
#   await page.screenshot({ path: screenshotDir + '/after-click.png' });
# }
```

### E2Eテスト（サンドボックス環境）

```bash
bash scripts/e2e-test.sh                    # 全E2Eテスト実行
bash scripts/e2e-test.sh auth               # 特定テストファイルのみ
bash scripts/e2e-test.sh navigation search  # 複数指定
```

### 環境の自動修復

```bash
bash scripts/auto-fix.sh          # 全コンポーネントを自動診断・修復
bash scripts/auto-fix.sh db       # DB のみ修復
bash scripts/auto-fix.sh servers  # API + Web サーバーのみ修復
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

- `apps/web/prisma/schema.prisma` - Prismaスキーマ定義（web側）
- `apps/api/prisma/schema.prisma` - Prismaスキーマ定義（API側）

### 検索

- `apps/web/src/libs/meilisearch/` - MeiliSearch統合
- `docker/meilisearch/` - 日本語対応MeiliSearch設定

## 開発時の注意事項

### GraphQL開発

1. NestJSでリゾルバー変更後、スキーマが自動生成される
2. フロントエンドで`pnpm --filter web codegen`実行で型を生成
3. プロキシ経由（`/api/graphql`）でのみAPIアクセス可能

### データベーススキーマ変更

1. `apps/web/prisma/schema.prisma` と `apps/api/prisma/schema.prisma` の両方を編集
2. `pnpm --filter web db:push` でDBに反映
3. `pnpm --filter web build` / `pnpm --filter api build` でPrismaクライアントが自動生成される

### MeiliSearch

- 日本語プロトタイプビルド使用のため、通常版との互換性なし
- インデックスリセット時は`docker compose restart meilisearch`

### デプロイ（GitHub Actions）

- masterブランチプッシュで自動デプロイ（Google Cloud Run）
- `apps/api`配下の変更でAPIデプロイトリガー
- 環境変数はGitHub Secretsで管理

## サンドボックス環境での開発

詳細は [docs/SANDBOX_SETUP.md](./docs/SANDBOX_SETUP.md) を参照。

## AI Agent 自律開発フロー（Claude Code on the Web）

> **対象環境**: このフローは **Claude Code on the Web**（サンドボックス環境）での自律開発を前提としている。ローカル環境では一部手順が異なる場合がある。

AI agentが新機能の実装からUI動作確認までを自律的に行うための標準フロー。
**各ステップを省略せず、順番に実行すること。**

### フロー全体像

```
1. 環境確認 → 2. 実装 → 3. 静的検証 → 4. サーバー再起動 → 5. 動作確認(E2E + UI) → 6. コミット
         ↑                                                           |
         └── 失敗時: auto-fix.sh で軽量リカバリ ←────────────────────┘
```

### Step 1: 環境確認

開発を始める前に環境が正常か確認する。SessionStart Hookで自動セットアップ済みだが、セッション中に壊れている可能性がある。

```bash
bash scripts/health-check.sh
```

- **全チェック成功** → Step 2 へ
- **失敗あり** → まず `bash scripts/auto-fix.sh` で軽量リカバリを試す。それでも失敗なら `bash scripts/sandbox-setup.sh` でフル再セットアップ

### Step 2: 実装

「新しいGraphQLエンドポイント追加手順」「コーディング規約」「禁止事項・よくあるミス」に従いコードを実装する。以下のチェックを実装中に意識すること。

#### 実装時の必須チェック

| 変更内容 | 必要なアクション |
|---|---|
| Prismaスキーマ変更 | `apps/web/prisma/schema.prisma` と `apps/api/prisma/schema.prisma` の**両方**を更新 |
| Prismaスキーマ変更 | `pnpm --filter web db:push && pnpm --filter api db:push` でDBに反映 |
| Prismaスキーマ変更 | `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter web prisma generate && PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter api prisma generate` でクライアント再生成 |
| GraphQLリゾルバー変更 | API側の変更が完了してからStep 4でサーバー再起動後に `pnpm --filter web codegen` で型を再生成 |
| 新しいNestJSモジュール追加 | `app.module.ts` の imports に登録 |
| ドメインモデル・ユースケース追加 | ユニットテスト(`*.spec.ts`)を作成 |

### Step 3: 静的検証

実装が終わったら、まず静的検証で基本的な品質を確認する。

```bash
pnpm validate
```

これにより **lint + 型チェック + テスト** が一括実行される。

- **成功** → Step 4 へ
- **失敗** → エラーを修正して再実行。よくある失敗:
  - lint エラー → `pnpm lint:fix` で自動修正を試す
  - 型エラー → codegen / prisma generate の漏れを確認
  - テスト失敗 → 既存テストを壊していないか確認

### Step 4: サーバー再起動

コード変更をdev serverに反映する。特に新ファイル追加やモジュール登録はwatchモードで拾えないことがあるため、**必ず再起動する**。

```bash
bash scripts/dev-server.sh restart
```

再起動後、サーバーが安定するまで待つ:

```bash
bash scripts/dev-server.sh status
```

#### GraphQLリゾルバーを変更した場合

サーバー再起動でスキーマが自動生成されるため、**再起動後に**フロントエンド型を再生成する:

```bash
pnpm --filter web codegen
```

### Step 5: 動作確認

#### 5a. E2Eテスト（推奨）

既存のE2Eテストを実行して、変更が既存機能を壊していないか確認する。

```bash
bash scripts/e2e-test.sh
```

特定の機能のみテストする場合:

```bash
bash scripts/e2e-test.sh auth navigation
```

#### 5b. UIスクリーンショット

UIスクリーンショットを撮影し、変更が正しく反映されているか目視確認する。

```bash
# 変更に関連するページを撮影
bash scripts/ui-check.sh /対象ページパス

# 例: トップページと本棚ページを確認
bash scripts/ui-check.sh / /testuser/sheets/本棚
```

撮影後、Read ツールで画像を確認:

```
Read /tmp/kidoku/screenshots/対象ページ.png
```

#### 5c. インタラクション検証（必要に応じて）

フォーム送信やボタンクリックなどの操作を検証する場合、カスタムスクリプトを使用:

```bash
bash scripts/ui-check.sh --script /tmp/kidoku/test-interaction.mjs
```

- **期待通り** → Step 6 へ
- **表示がおかしい** → Step 2 に戻って修正

### Step 6: コミット

すべての検証が通ったら変更をコミットする。

```bash
git add <変更ファイル>
git commit -m "feat: 機能の説明"
```

### よくあるエラーと自動回復

**まず `bash scripts/auto-fix.sh` を試すこと。** 多くの問題はこのスクリプトで自動修復される。

個別に対処する場合:

| 症状 | 原因 | 回復コマンド |
|---|---|---|
| `ECONNREFUSED :3000` | Webサーバー停止 | `bash scripts/auto-fix.sh web` |
| `ECONNREFUSED :4000` | APIサーバー停止 | `bash scripts/auto-fix.sh api` |
| `Can't reach database server` | MySQLコンテナ停止 | `bash scripts/auto-fix.sh db` |
| `Table 'kidoku.xxx' doesn't exist` | db:push 漏れ | `pnpm --filter web db:push && pnpm --filter api db:push` |
| `Unknown type "XxxInput"` | codegen 漏れ | `pnpm --filter web codegen` |
| `Cannot find module '@prisma/client'` | prisma generate 漏れ | `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter web prisma generate && PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter api prisma generate` |
| dev-server起動しない | ポート競合 | `bash scripts/dev-server.sh stop && bash scripts/dev-server.sh start` |
| Prismaスキーマ不一致 | 片方だけ編集した | `diff apps/web/prisma/schema.prisma apps/api/prisma/schema.prisma` で差分確認し両方を同期 |

## トラブルシューティング

### 型エラー

```bash
# GraphQL型の再生成
pnpm --filter web codegen

# Prismaクライアント再生成
pnpm --filter web prisma generate
pnpm --filter api prisma generate
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
docker compose down && docker compose up -d

# MeiliSearchデータリセット
rm -rf docker/meilisearch/data/meilisearch
docker compose up -d meilisearch
```