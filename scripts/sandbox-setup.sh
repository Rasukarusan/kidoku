#!/usr/bin/env bash
# Claude Code on the Web（クラウドサンドボックス）環境の自動セットアップスクリプト
# SessionStart Hook から呼び出されることを想定
#
# 環境判定:
#   CLAUDE_CODE_REMOTE=true  → Claude Code on the Web のクラウド環境
#   SANDBOX=1                → 手動で強制実行する場合
#
# 参考: https://code.claude.com/docs/ja/claude-code-on-the-web
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="/tmp/kidoku"
mkdir -p "$LOG_DIR"

# カラー出力
green() { echo -e "\033[32m✓ $*\033[0m"; }
yellow() { echo -e "\033[33m⏳ $*\033[0m"; }
red() { echo -e "\033[31m✗ $*\033[0m"; }
info() { echo -e "\033[36mℹ $*\033[0m"; }

# ==============================================================================
# 1. Claude Code on the Web 環境判定
# ==============================================================================
# CLAUDE_CODE_REMOTE: Claude Code on the Web のクラウドVM内で "true" に設定される
# SANDBOX: 手動実行用のフォールバック
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ] && [ -z "${SANDBOX:-}" ]; then
  info "Claude Code on the Web 環境ではありません。SANDBOX=1 を設定して強制実行できます。"
  exit 0
fi

# ==============================================================================
# 2. 依存パッケージのインストール
# ==============================================================================
yellow "依存パッケージをインストール中..."
cd "$PROJECT_ROOT"
if [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile 2>"$LOG_DIR/pnpm-install.log" || pnpm install 2>"$LOG_DIR/pnpm-install.log"
else
  pnpm install 2>"$LOG_DIR/pnpm-install.log"
fi
green "依存パッケージのインストール完了"

# ==============================================================================
# 3. Docker デーモン起動（プロキシ設定付き）
# ==============================================================================
if ! docker info &>/dev/null; then
  yellow "Docker デーモンを起動中..."

  # サンドボックスのエグレスプロキシを Docker デーモンに設定
  # curl/npm 等は HTTP_PROXY 環境変数で外部通信できるが、Docker デーモンは
  # daemon.json の proxies 設定が必要
  if [ -n "${HTTP_PROXY:-}" ]; then
    sudo mkdir -p /etc/docker
    cat <<DAEMON_EOF | sudo tee /etc/docker/daemon.json >/dev/null
{
  "proxies": {
    "http-proxy": "${HTTP_PROXY}",
    "https-proxy": "${HTTPS_PROXY:-${HTTP_PROXY}}",
    "no-proxy": "localhost,127.0.0.1"
  },
  "dns": ["8.8.8.8", "8.8.4.4"]
}
DAEMON_EOF
    green "Docker プロキシ設定完了"
  fi

  sudo -E dockerd &>"$LOG_DIR/dockerd.log" &
  # デーモン起動待ち（最大30秒）
  for i in $(seq 1 30); do
    if docker info &>/dev/null; then
      break
    fi
    sleep 1
  done
  if docker info &>/dev/null; then
    green "Docker デーモン起動完了"
  else
    red "Docker デーモンの起動に失敗しました。ログ: $LOG_DIR/dockerd.log"
    exit 1
  fi
else
  green "Docker デーモンは既に起動済み"
fi

# ==============================================================================
# 4. docker compose でコンテナ起動（MySQL + MeiliSearch）
# ==============================================================================
yellow "docker compose でコンテナを起動中..."
cd "$PROJECT_ROOT"

# .env がなければ .env.example からコピー（docker-compose.yml が参照する変数用）
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
  green ".env ファイル生成完了"
fi

# docker compose up（イメージ未取得ならpullも実行）
docker compose up -d 2>"$LOG_DIR/docker-compose.log"
green "docker compose up 完了"

# DB コンテナ起動待ち（最大30秒）
yellow "MySQL の起動を待機中..."
for i in $(seq 1 30); do
  if docker exec kidoku_db mysql -u dev -ppass -e "SELECT 1" &>/dev/null; then
    break
  fi
  sleep 1
done
if docker exec kidoku_db mysql -u dev -ppass -e "SELECT 1" &>/dev/null; then
  green "MySQL 起動確認完了"
else
  red "MySQL の起動に失敗しました。ログ: docker compose logs db"
fi

# ==============================================================================
# 5. 環境変数ファイル生成
# ==============================================================================
DB_URL="mysql://dev:pass@localhost:13306/kidoku"

if [ ! -f "$PROJECT_ROOT/apps/web/.env" ]; then
  cp "$PROJECT_ROOT/apps/web/.env.example" "$PROJECT_ROOT/apps/web/.env"
  green "apps/web/.env ファイル生成完了"
else
  green "apps/web/.env ファイルは既に存在"
fi
# サンドボックス用設定を反映（既存ファイルでも上書き）
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" "$PROJECT_ROOT/apps/web/.env"
sed -i 's|^NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=.*|NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true|' "$PROJECT_ROOT/apps/web/.env"
sed -i 's|^BACKDOOR_USER_EMAIL=.*|BACKDOOR_USER_EMAIL=test@example.com|' "$PROJECT_ROOT/apps/web/.env"
# ENABLE_BACKDOOR_LOGIN がなければ追加
grep -q '^NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=' "$PROJECT_ROOT/apps/web/.env" || \
  echo 'NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true' >> "$PROJECT_ROOT/apps/web/.env"
grep -q '^BACKDOOR_USER_EMAIL=' "$PROJECT_ROOT/apps/web/.env" || \
  echo 'BACKDOOR_USER_EMAIL=test@example.com' >> "$PROJECT_ROOT/apps/web/.env"

if [ ! -f "$PROJECT_ROOT/apps/api/.env" ]; then
  cp "$PROJECT_ROOT/apps/api/.env.example" "$PROJECT_ROOT/apps/api/.env"
  green "apps/api/.env ファイル生成完了"
else
  green "apps/api/.env ファイルは既に存在"
fi
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DB_URL\"|" "$PROJECT_ROOT/apps/api/.env"
sed -i 's|^MEILI_HOST=.*|MEILI_HOST=http://localhost:7700|' "$PROJECT_ROOT/apps/api/.env"

# ==============================================================================
# 6. Prisma スキーマ反映 + クライアント生成
# ==============================================================================
yellow "Prisma スキーマを DB に反映中..."
DATABASE_URL="$DB_URL" pnpm --filter web exec prisma db push --skip-generate 2>"$LOG_DIR/prisma-push.log"
green "Prisma db push 完了"

yellow "Prisma クライアントを生成中..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter web exec prisma generate 2>"$LOG_DIR/prisma-gen-web.log"
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter api exec prisma generate 2>"$LOG_DIR/prisma-gen-api.log"
green "Prisma クライアント生成完了"

# ==============================================================================
# 7. シードデータ投入
# ==============================================================================
SEED_CHECK=$(docker exec kidoku_db mysql -u dev -ppass kidoku -N -e "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
if [ "$SEED_CHECK" = "0" ] || [ "$SEED_CHECK" = "" ]; then
  yellow "シードデータを投入中..."
  DATABASE_URL="$DB_URL" node "$PROJECT_ROOT/scripts/sandbox-seed.js" 2>"$LOG_DIR/seed.log" || {
    info "sandbox-seed.js が失敗しました。ログ: $LOG_DIR/seed.log"
  }
  green "シードデータ投入完了"
else
  green "シードデータは既に存在 (users: $SEED_CHECK 件)"
fi

# ==============================================================================
# 8. MeiliSearch シードデータ投入
# ==============================================================================
MEILI_HEALTH=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:7700/health 2>/dev/null || echo "000")
if [ "$MEILI_HEALTH" = "200" ]; then
  MEILI_DOCS=$(curl -s -H "Authorization: Bearer YourMasterKey" http://localhost:7700/indexes/books/stats 2>/dev/null | node -e "
    let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
      try { console.log(JSON.parse(d).numberOfDocuments||0) } catch { console.log(0) }
    })
  " 2>/dev/null || echo "0")
  if [ "$MEILI_DOCS" = "0" ] || [ "$MEILI_DOCS" = "" ]; then
    yellow "MeiliSearch シードデータを投入中..."
    DATABASE_URL="$DB_URL" node "$PROJECT_ROOT/scripts/seed-meilisearch.js" 2>"$LOG_DIR/seed-meili.log" || {
      info "seed-meilisearch.js が失敗しました。ログ: $LOG_DIR/seed-meili.log"
    }
    green "MeiliSearch シードデータ投入完了"
  else
    green "MeiliSearch シードデータは既に存在 (documents: $MEILI_DOCS 件)"
  fi
else
  info "MeiliSearch が起動していないため、シード投入をスキップしました"
fi

# ==============================================================================
# 9. 開発サーバー起動
# ==============================================================================
"$SCRIPT_DIR/dev-server.sh" start

# ==============================================================================
# 10. ヘルスチェック
# ==============================================================================
"$SCRIPT_DIR/health-check.sh"

green "サンドボックスセットアップ完了！"
