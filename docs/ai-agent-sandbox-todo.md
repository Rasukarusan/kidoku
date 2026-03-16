# AI Agent サンドボックス自律開発 — 対応状況と残TODO

> 最終更新: 2026-03-15
> 対象環境: **Claude Code on the Web**（クラウドサンドボックス）

## Claude Code on the Web とは

[Claude Code on the Web](https://code.claude.com/docs/ja/claude-code-on-the-web) は、claude.ai からブラウザ上で Claude Code タスクを実行できる機能。Anthropic 管理の仮想マシン上でリポジトリがクローンされ、セキュアなクラウド環境でコード変更・テスト・PR作成が行われる。

本ドキュメントの自動セットアップは、このクラウドVM上で Docker コンテナ（MariaDB・MeiliSearch）を起動し、開発サーバーを立ち上げて AI agent が自律的に開発・動作確認できるようにするためのもの。

### 環境の判別方法

| 環境変数 | 値 | 意味 |
|---|---|---|
| `CLAUDE_CODE_REMOTE` | `"true"` | Claude Code on the Web のクラウドVM内 |
| `SANDBOX` | `"1"` | 手動で強制実行する場合のフォールバック |

スクリプト内での判定例:
```bash
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ] && [ -z "${SANDBOX:-}" ]; then
  echo "Claude Code on the Web 環境ではありません"
  exit 0
fi
```

### セットアップスクリプト vs SessionStart Hook

Claude Code on the Web には2つのセットアップ手段がある（[公式ドキュメント参照](https://code.claude.com/docs/ja/claude-code-on-the-web#setup-scripts)）:

| | セットアップスクリプト | SessionStart Hook |
|---|---|---|
| 設定場所 | クラウド環境 UI | リポジトリの `.claude/settings.json` |
| 実行タイミング | Claude Code 起動**前**、新規セッションのみ | Claude Code 起動**後**、再開含む全セッション |
| スコープ | クラウド環境のみ | ローカル + クラウド両方 |

本リポジトリでは **SessionStart Hook** を採用（`.claude/hooks.json`）。理由:
- リポジトリにコミットされるため設定が共有される
- セッション再開時も実行される（コンテナが停止していた場合の復帰に有効）
- `CLAUDE_CODE_REMOTE` で環境判定してローカルでは実行しない

---

## 対応状況サマリー

| # | 項目 | 状態 | 備考 |
|---|------|------|------|
| 1 | SessionStart Hook | **完了** | `.claude/hooks.json` 作成済み |
| 2 | `.claude/settings.json` の許可拡充 | **完了** | Docker/Prisma/curl等を追加済み |
| 3 | 環境セットアップ自動化スクリプト | **完了** | `scripts/sandbox-setup.sh` |
| 4 | ヘルスチェックスクリプト | **完了** | `scripts/health-check.sh` |
| 5 | E2Eテストのサンドボックス対応 | **未対応** | ブラウザ自動インストール等 |
| 6 | 開発サーバーのバックグラウンド管理 | **完了** | `scripts/dev-server.sh` |
| 7 | UI変更後の自動スクリーンショット確認 | **完了** | `scripts/ui-check.sh` |

---

## 完了済み

### 1. SessionStart Hook

`.claude/hooks.json` を作成。セッション開始時に `scripts/sandbox-setup.sh` を自動実行する。

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash scripts/sandbox-setup.sh 2>&1 | tail -30",
        "timeout": 300
      }
    ]
  }
}
```

### 2. `.claude/settings.json` の許可拡充

以下のカテゴリのコマンドを事前許可に追加:

- Docker 操作: `docker info`, `docker ps*`, `docker run *`, `docker exec *`, `docker start *`, `docker logs *`
- Docker デーモン: `sudo -E dockerd *`, `sudo update-alternatives *`
- Prisma: `DATABASE_URL=* npx prisma *`, `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=* npx prisma*`
- シード: `DATABASE_URL=* npx tsx *`, `node scripts/*`
- 動作確認: `curl *localhost*`
- スクリプト: `bash scripts/*`, `./scripts/*`
- プロセス管理: `kill *`, `pkill *`
- ログ確認: `tail *`, `cat /tmp/*`
- 環境設定: `cp .env.example .env` 等
- Playwright: `npx playwright*`

### 3. 環境セットアップ自動化スクリプト (`scripts/sandbox-setup.sh`)

`CLAUDE_CODE_REMOTE=true` を検出して、ワンコマンドで以下を実行:

1. `pnpm install`
2. iptables を legacy モードに切り替え
3. Docker デーモン起動（起動済みならスキップ）
4. MariaDB コンテナ起動（既存なら再利用）
5. MeiliSearch コンテナ起動（既存なら再利用）
6. `.env` ファイル生成（裏口ログイン有効化込み）
7. Prisma db push + クライアント生成
8. シードデータ投入（未投入時のみ）
9. 開発サーバー起動
10. ヘルスチェック実行

**動作確認済み**: 実際にクラウドサンドボックス上で全ステップが正常完了することを確認。

**セッション中に発見・修正した問題**:
- `npx prisma` が v7 を取得する → `pnpm --filter exec prisma` に変更
- `sandbox-seed.js` が `@prisma/client` をモジュール解決できない → `apps/web/node_modules` を直接参照するように修正
- Prisma の unique キー名 (`uniq_user_id_name` → `userId_name`) とリレーション構文 (`sheet_id` → `sheet: { connect: ... }`) を修正

### 4. ヘルスチェックスクリプト (`scripts/health-check.sh`)

以下を自動チェックし、サマリーを表示:

- Docker デーモン起動状態
- MariaDB コンテナ起動 + 接続確認 + テーブル存在確認 + シードデータ確認
- MeiliSearch コンテナ起動 + ヘルスエンドポイント確認
- API サーバー (NestJS) 疎通 + 認証付き GraphQL クエリ
- Web サーバー (Next.js) HTTP 200 確認

**動作確認済み**: 10/10 チェック成功。

### 6. 開発サーバーのバックグラウンド管理 (`scripts/dev-server.sh`)

サブコマンド:
- `start` — API + Web をバックグラウンド起動（PIDファイルで管理）
- `stop` — 停止（子プロセスも含む）
- `restart` — 再起動
- `status` — 起動状態確認
- `logs [api|web|all]` — ログ表示

ログ出力先: `/tmp/kidoku/api.log`, `/tmp/kidoku/web.log`

### 追加: pnpm v10 ビルドスクリプト許可

`pnpm-workspace.yaml` に `onlyBuiltDependencies` を追加。`pnpm install` 時に Prisma 等のビルドスクリプトが自動実行されるようになり、型チェックエラーが解消された。

---

## 未対応（残TODO）

### 5. E2Eテストのサンドボックス対応

**現状**: Playwright config にサンドボックス検出ロジックはあるが、以下が未対応。

**やるべきこと**:

- [ ] `scripts/sandbox-setup.sh` にブラウザインストールを追加
  ```bash
  npx playwright install chromium --with-deps
  ```
- [ ] `pnpm --filter web test:e2e` をサンドボックスで実行できるようにする
- [ ] E2Eテスト実行時にフロントエンド・APIが起動済みか確認し、未起動なら `scripts/dev-server.sh start` を先に呼ぶ仕組み
- [ ] CI (`.github/workflows/ci.yml`) に E2E テストジョブを追加
  - MariaDB / MeiliSearch を `services` で起動
  - Prisma db push + seed + サーバー起動 → Playwright 実行

**優先度**: 中（E2Eテスト自体がまだ少ないため、テストが増えてからでも良い）

---

---

## テストインフラ詳細調査（2026-03-16）

### テストファイルの分布

| 対象 | ファイル数 | 備考 |
|------|-----------|------|
| API ドメインモデル | 7 | `*.spec.ts`（book, user, sheet, comment, template-book, ai-summary, software-design） |
| API ユースケース | 25 | 各機能のユースケース単体テスト |
| API インフラ | 1 | `rakuten-books.spec.ts` |
| API E2E | 5 | `apps/api/test/`（app, book, comment, sheet, user） |
| Web ユニットテスト | 2 | `string.test.ts`, `migrator.test.ts` |
| Web E2E (Playwright) | 9 | `apps/web/e2e/`（auth, book-crud, navigation, search 等） |

### テストヘルパー・フィクスチャ

| ファイル | 用途 |
|---|---|
| `apps/api/test/helpers/app.helper.ts` | NestJSテストアプリ作成（全リポジトリモック済み） |
| `apps/api/test/helpers/auth.helper.ts` | HMAC-SHA256署名生成 |
| `apps/web/e2e/fixtures.ts` | 裏口ログイン付きページコンテキスト |

### 外部依存のモック状況

| 外部依存 | モック方法 | 状態 |
|----------|-----------|------|
| Prisma/DB | jest.fn() で完全モック | ✅ |
| Rakuten Books API | jest.spyOn(global, 'fetch') | ✅ |
| MeiliSearch | 空オブジェクト（`index()` が空を返す） | ⚠️ 最低限 |
| Stripe（決済） | なし | ❌ |
| Vercel Blob/KV | なし | ❌ |
| Cohere AI | なし | ❌ |
| Resend（メール） | なし | ❌ |

### 改善が必要な項目

#### 優先度: 高

1. **フロントエンドのユニットテストが極端に少ない**（2ファイルのみ）
   - 主要コンポーネント・hooksのテストを追加すると、フロントエンド変更時の影響検知が可能になる
   - AI agentがフロントエンドの変更を加えた後にテストで正しさを検証する手段がほぼない

2. **E2EテストがCIに未組み込み**
   - 現在CIで実行されるのはユニットテストのみ
   - PRマージ前にUI破壊を防止するにはCI組み込みが必要

#### 優先度: 中

3. **テストデータファクトリ/ビルダーが未導入**
   - シードデータ（`prisma/seed.ts`）は静的な初期データのみ
   - テスト間のDB状態リセット機構がない
   - ファクトリライブラリ（Faker等）が未導入
   - AI agentが新機能のテストを書く際にテストデータを効率的に作る仕組みがない

4. **`pnpm validate` のよくある失敗パターンと対処法をCLAUDE.mdに追記する**
   - AI agentが型エラーやlintエラーに遭遇した際の自律修正精度が向上する

5. **Playwright自動UIチェックのヘルパースクリプト整備**
   - 変更後にAI agentが自動でUIを確認する仕組みが確立されていない

#### 優先度: 低

6. **外部サービスモックの充実**（Stripe, Cohere, Vercel Blob/KV, Resend）
   - 関連機能のテスト可能化

7. **テスト専用Docker Compose設定**
   - 本番と共用のため、E2Eテスト実行時にDBデータが汚染される可能性

### `pnpm validate` よくある失敗パターンと対処法

| エラーパターン | 原因 | 対処 |
|---------------|------|------|
| `TS2307: Cannot find module '@generated/...'` | GraphQL型が未生成 | `pnpm --filter web codegen` |
| `TS2305: Module has no exported member` | Prismaクライアントが古い | `pnpm --filter web prisma generate && pnpm --filter api prisma generate` |
| `TS2322: Type 'X' is not assignable to type 'Y'` | ドメインモデルやDTOの型不整合 | 変更したモデル/DTOのフィールドと型を確認 |
| `ESLint: 'xxx' is defined but never used` | 未使用import/変数 | 該当行を削除 |
| `ESLint: Missing return type on function` | 関数の戻り値型が未定義 | 戻り値の型注釈を追加 |
| `Jest: Cannot find module 'xxx'` | モジュールパスの解決失敗 | `tsconfig.json` の `paths` 設定を確認 |
| `Jest: Expected/Received mismatch` | テストデータとドメインモデルの不整合 | テスト側のモックデータを更新 |

---

## ファイル一覧

| ファイル | 用途 |
|---|---|
| `.claude/hooks.json` | SessionStart Hook 定義 |
| `.claude/settings.json` | 許可コマンド設定 |
| `scripts/sandbox-setup.sh` | 環境一括セットアップ（`CLAUDE_CODE_REMOTE` で判定） |
| `scripts/dev-server.sh` | 開発サーバー管理 |
| `scripts/health-check.sh` | ヘルスチェック |
| `scripts/sandbox-seed.js` | シードデータ投入 |
| `pnpm-workspace.yaml` | ビルドスクリプト許可設定（`onlyBuiltDependencies`） |
| `scripts/ui-check.sh` | UI変更後のスクリーンショット撮影（Playwright v1.50.0） |
| `SANDBOX_SETUP.md` | セットアップ手順ドキュメント（手動手順） |
