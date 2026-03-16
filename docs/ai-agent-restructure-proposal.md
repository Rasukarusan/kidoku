# AIエージェントフレンドリーなリポジトリ構造改善提案

> 調査日: 2026-02-21
> 最終更新: 2026-03-15
> 対象リポジトリ: kidoku（読書記録・分析アプリケーション）

## 進捗サマリー

| Phase | 内容 | 状態 |
|-------|------|------|
| Phase 1 | CLAUDE.mdの抜本的強化 | **完了** |
| Phase 2 | テスト基盤の構築 | **完了** (51テストファイル) |
| Phase 3 | CI/CD（PR検証ワークフロー） | **完了** |
| Phase 4 | 開発ガードレール | **完了** |
| Phase 5 | Turborepoタスク整備 | **完了** |
| 追加 | サンドボックス自動セットアップ | **完了** |
| 追加 | pnpm v10 ビルドスクリプト許可 | **完了** |

---

## 完了済みの項目

### Phase 1: CLAUDE.mdの抜本的強化 ✅

- コーディング規約（ファイル命名、ドメインモデル、リポジトリ、ユースケースパターン）
- 新しいGraphQLエンドポイント追加手順（Step 1〜12）
- Dual Prismaスキーマ同期ガイド
- 禁止事項・よくあるミス一覧
- 開発コマンド一覧
- サンドボックス環境セットアップへのリンク

### Phase 2: テスト基盤の構築 ✅

テストファイル: **2個 → 51個** に大幅増加

- ドメインモデルテスト: `apps/api/src/domain/models/*.spec.ts` (7ファイル)
- ユースケーステスト: `apps/api/src/application/usecases/**/*.spec.ts` (多数)
- インフラ層テスト: `apps/api/src/infrastructure/repositories/*.spec.ts`
- Webテスト: `apps/web/src/**/*.test.ts`

### Phase 3: CI/CD（PR検証ワークフロー） ✅

`.github/workflows/ci.yml` が存在し、PR時に以下を自動実行:
- lint
- type-check（Prisma generate 込み）
- test-api
- test-web

### Phase 4: 開発ガードレール ✅

- `pnpm validate` コマンド（lint + check-types + test 一括実行）
- `.husky/pre-push` フック（`pnpm test`）
- `.claude/settings.json` に許可コマンド設定済み

### Phase 5: Turborepoタスク整備 ✅

`turbo.json` に `test` タスクが追加済み（inputs, outputs, dependsOn 設定あり）

### 追加: サンドボックス自動セットアップ ✅

- `scripts/sandbox-setup.sh`: Docker・DB・シード・サーバーの一括セットアップ
- `scripts/dev-server.sh`: 開発サーバー管理（start/stop/restart/status/logs）
- `scripts/health-check.sh`: 全コンポーネントのヘルスチェック
- `.claude/hooks.json`: SessionStart Hook で自動実行
- `pnpm-workspace.yaml`: `onlyBuiltDependencies` でPrisma等のビルドスクリプト許可

### 追加: ESLint設定統一 ✅

web/api ともに `eslint.config.mjs`（flat config）に統一済み。

---

## 残りのTODO

### 優先度: 高

#### 1. TypeScript strict mode 有効化（Web）

`apps/web/tsconfig.json` で `"strict": false`, `"strictNullChecks": false` のまま。

**現状の問題**: 型安全でないコードがチェックをすり抜ける。`null` や `undefined` に起因するバグをコンパイル時に検出できない。

**対応方針**:
1. まず `"strictNullChecks": true` を有効化（影響が最も大きい設定）
2. 型エラーを段階的に修正（`as` キャストや `!` の乱用は避け、適切な型ガードを使用）
3. 最終的に `"strict": true` に移行

**推定影響範囲**: `apps/web/src/` 配下の約196ファイル。大量の型エラーが出る可能性が高いため段階的に対応すること。

#### 2. E2Eテストの導入

現在はユニットテストのみ。ユーザーの主要フローをカバーするE2Eテストがない。

**対応方針**:
1. Playwright をセットアップ（`apps/web` に導入）
2. 主要フローのE2Eテストを作成:
   - ログイン → 本棚表示
   - 書籍追加 → 一覧に反映
   - 書籍検索
   - シート操作（作成・切替・削除）
3. CI に E2E テストジョブを追加（DBコンテナが必要なため `services` を設定）

**関連**: サンドボックス環境の `scripts/sandbox-setup.sh` がそのまま活用可能。Playwright MCP も `.mcp.json` に設定済み。

#### 3. APIインテグレーションテスト

リポジトリ実装のテストがモック依存。実際のDBに対するインテグレーションテストがない。

**対応方針**:
1. テスト用DBコンテナを起動する仕組みを用意（docker-compose.test.yml 等）
2. `apps/api/test/` にインテグレーションテストを配置
3. Prisma の `$transaction` + ロールバックパターンでテストデータの分離
4. 対象: BookRepository, SheetRepository 等の主要リポジトリ

### 優先度: 中

#### 4. Prismaスキーマの一元化

現状 `apps/web/prisma/schema.prisma` と `apps/api/prisma/schema.prisma` が別々に存在し、手動同期が必要。

**対応方針**:
1. `packages/database/` 共有パッケージを作成
2. Prisma スキーマを一元管理し、生成された Client を web/api から参照
3. `pnpm-workspace.yaml` の packages に追加
4. CLAUDE.md のスキーマ同期ガイドを更新

**注意**: web と api で異なる Prisma Client 設定（generator の output 等）が必要な場合は、共有スキーマから複数の Client を生成する設計にする。

#### 5. 共有型定義パッケージの導入

web/api 間で共有する型定義（GraphQL の Input/Output 型に対応するもの等）が重複している。

**対応方針**:
1. `packages/shared-types/` を作成
2. web の `codegen` で生成される型と api の DTO で共通する型を切り出し
3. Turborepo の依存関係を設定

#### 6. CI の高速化

現在の CI は4ジョブすべてで `pnpm install` を実行している。

**対応方針**:
- pnpm store のキャッシュを共有
- Turborepo の Remote Cache を有効化
- `pnpm install` ジョブを1つにまとめ、artifact として `node_modules` を共有

### 優先度: 低

#### 7. pre-push フックの強化

現在は `pnpm test` のみ。`pnpm validate`（lint + check-types + test）にすべき。

**対応**: `.husky/pre-push` を `pnpm validate` に変更するだけ。ただし開発体験とのバランスに注意（push が遅くなる）。

#### 8. バンドルサイズの監視

`pnpm --filter web analyze` コマンドは存在するが、CIでの自動チェックがない。

**対応方針**: `@next/bundle-analyzer` の結果を PR コメントに自動投稿する GitHub Action を追加。

#### 9. セキュリティ監査の自動化

依存パッケージの脆弱性チェックが自動化されていない。

**対応方針**: `pnpm audit` を CI に追加、または Dependabot / Renovate を導入。

---

### 10. フロントエンドユニットテストの拡充

現在 Web のユニットテストは **2ファイルのみ**（`string.test.ts`, `migrator.test.ts`）。API 側は36ファイルと充実している一方、フロントエンドの変更に対するテストによる検証手段がほぼない。

**対応方針**:
1. 主要コンポーネント（BookCard, SheetList 等）のテストを追加
2. カスタムhooks のテストを追加（`@testing-library/react-hooks`）
3. ユーティリティ関数のテストを追加
4. 目標: 主要な UI パスに対して最低限のスナップショットテスト + ロジックテスト

### 11. テストデータファクトリの導入

テストデータの作成が手動のオブジェクトリテラルに依存しており、AI agentが新機能テスト作成時にボイラープレートが多くなる。

**対応方針**:
1. `apps/api/test/factories/` に各エンティティのファクトリを作成
2. デフォルト値 + オーバーライドパターン（例: `createBookFixture({ title: 'テスト' })`）
3. テスト間のDB状態リセット機構を追加（トランザクションロールバック or truncate）

### 12. 外部サービスモックの充実

Stripe・Cohere AI・Vercel Blob/KV・Resend のモックが未実装。関連機能の変更時にテストで検証できない。

**対応方針**:
1. `apps/api/test/mocks/` に各外部サービスのモックモジュールを配置
2. Jest の `moduleNameMapper` で自動的にモックに差し替え
3. 主要な成功/失敗パターンをモックで再現可能にする

---

## 将来的な改善候補（スコープ外）

- Prisma Migrate への移行（現在は `db:push` のみ）
- MeiliSearch の Docker イメージを日本語プロトタイプから正式版に移行（upstream の対応待ち）
- Next.js App Router への移行（Pages Router からの段階的移行）
- モノレポツールの Nx 移行検討（Turborepo からの乗り換え）
