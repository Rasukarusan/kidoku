# AI Agent サンドボックス自律開発 — 対応状況と残TODO

> 最終更新: 2026-03-15

## 対応状況サマリー

| # | 項目 | 状態 | 備考 |
|---|------|------|------|
| 1 | SessionStart Hook | **完了** | `.claude/hooks.json` 作成済み |
| 2 | `.claude/settings.json` の許可拡充 | **完了** | Docker/Prisma/curl等を追加済み |
| 3 | 環境セットアップ自動化スクリプト | **完了** | `scripts/sandbox-setup.sh` |
| 4 | ヘルスチェックスクリプト | **完了** | `scripts/health-check.sh` |
| 5 | E2Eテストのサンドボックス対応 | **未対応** | ブラウザ自動インストール等 |
| 6 | 開発サーバーのバックグラウンド管理 | **完了** | `scripts/dev-server.sh` |

---

## 完了済み（今回のセッションで対応）

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

ワンコマンドで以下を実行:

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

**動作確認済み**: 実際にサンドボックス上で全ステップが正常完了することを確認。

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
- [ ] `.claude/settings.json` に `Bash(npx playwright install*)` を追加（※現在は `Bash(npx playwright*)` で包含されているはず）
- [ ] E2Eテスト実行時にフロントエンド・APIが起動済みか確認し、未起動なら `scripts/dev-server.sh start` を先に呼ぶ仕組み
- [ ] CI (`.github/workflows/ci.yml`) に E2E テストジョブを追加
  - MariaDB / MeiliSearch を `services` で起動
  - Prisma db push + seed + サーバー起動 → Playwright 実行

**優先度**: 中（E2Eテスト自体がまだ少ないため、テストが増えてからでも良い）

---

## ファイル一覧

| ファイル | 用途 |
|---|---|
| `.claude/hooks.json` | SessionStart Hook 定義 |
| `.claude/settings.json` | 許可コマンド設定 |
| `scripts/sandbox-setup.sh` | 環境一括セットアップ |
| `scripts/dev-server.sh` | 開発サーバー管理 |
| `scripts/health-check.sh` | ヘルスチェック |
| `scripts/sandbox-seed.js` | シードデータ投入 |
| `pnpm-workspace.yaml` | ビルドスクリプト許可設定（`onlyBuiltDependencies`） |
| `SANDBOX_SETUP.md` | セットアップ手順ドキュメント |
