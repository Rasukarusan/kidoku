#!/usr/bin/env bash
# サンドボックス環境の自動セットアップスクリプト
# SessionStart Hook から呼び出されることを想定
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
# 1. サンドボックス環境判定
# ==============================================================================
if [ -z "${SANDBOX:-}" ] && [ ! -f /run/.containerenv ] && [ ! -f /.dockerenv ]; then
  info "サンドボックス環境ではないようです。SANDBOX=1 を設定して強制実行できます。"
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
# 3. iptables を legacy に切り替え
# ==============================================================================
if command -v update-alternatives &>/dev/null; then
  yellow "iptables を legacy モードに切り替え中..."
  sudo update-alternatives --set iptables /usr/sbin/iptables-legacy 2>/dev/null || true
  sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy 2>/dev/null || true
  green "iptables 設定完了"
fi

# ==============================================================================
# 4. Docker デーモン起動
# ==============================================================================
if ! docker info &>/dev/null; then
  yellow "Docker デーモンを起動中..."
  sudo -E dockerd --iptables=false --bridge=none --storage-driver=vfs &>"$LOG_DIR/dockerd.log" &
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
# 5. DB コンテナ起動（MariaDB）
# ==============================================================================
if docker ps --format '{{.Names}}' | grep -q '^kidoku_db$'; then
  green "MariaDB コンテナは既に起動済み"
elif docker ps -a --format '{{.Names}}' | grep -q '^kidoku_db$'; then
  yellow "MariaDB コンテナを再起動中..."
  docker start kidoku_db
  green "MariaDB コンテナ再起動完了"
else
  yellow "MariaDB コンテナを作成中..."
  docker run -d --name kidoku_db --network=host \
    -e MARIADB_ROOT_PASSWORD=pass \
    -e MARIADB_DATABASE=kidoku \
    -e MARIADB_USER=dev \
    -e MARIADB_PASSWORD=pass \
    mariadb:lts
  green "MariaDB コンテナ作成完了"
fi

# ==============================================================================
# 6. MeiliSearch コンテナ起動
# ==============================================================================
if docker ps --format '{{.Names}}' | grep -q '^kidoku_meilisearch$'; then
  green "MeiliSearch コンテナは既に起動済み"
elif docker ps -a --format '{{.Names}}' | grep -q '^kidoku_db$'; then
  yellow "MeiliSearch コンテナを再起動中..."
  docker start kidoku_meilisearch 2>/dev/null || {
    docker run -d --name kidoku_meilisearch --network=host \
      -e MEILI_HTTP_ADDR=0.0.0.0:7700 \
      -e MEILI_MASTER_KEY=YourMasterKey \
      getmeili/meilisearch:prototype-japanese-6
  }
  green "MeiliSearch コンテナ起動完了"
else
  yellow "MeiliSearch コンテナを作成中..."
  docker run -d --name kidoku_meilisearch --network=host \
    -e MEILI_HTTP_ADDR=0.0.0.0:7700 \
    -e MEILI_MASTER_KEY=YourMasterKey \
    getmeili/meilisearch:prototype-japanese-6
  green "MeiliSearch コンテナ作成完了"
fi

# コンテナ起動待ち
yellow "コンテナの起動を待機中..."
for i in $(seq 1 30); do
  if docker exec kidoku_db mariadb -u dev -ppass -e "SELECT 1" &>/dev/null; then
    break
  fi
  sleep 1
done
green "コンテナ起動確認完了"

# ==============================================================================
# 7. 環境変数ファイル生成
# ==============================================================================
DB_URL="mysql://dev:pass@localhost:3306/kidoku"

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
  sed -i 's|DB_HOST=.*|DB_HOST=localhost|' "$PROJECT_ROOT/.env"
  sed -i 's|DB_PORT=.*|DB_PORT=3306|' "$PROJECT_ROOT/.env"
  green ".env ファイル生成完了"
else
  green ".env ファイルは既に存在"
fi

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
# 8. Prisma スキーマ反映 + クライアント生成
# ==============================================================================
yellow "Prisma スキーマを DB に反映中..."
DATABASE_URL="$DB_URL" pnpm --filter web exec prisma db push --skip-generate 2>"$LOG_DIR/prisma-push.log"
green "Prisma db push 完了"

yellow "Prisma クライアントを生成中..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter web exec prisma generate 2>"$LOG_DIR/prisma-gen-web.log"
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm --filter api exec prisma generate 2>"$LOG_DIR/prisma-gen-api.log"
green "Prisma クライアント生成完了"

# ==============================================================================
# 9. シードデータ投入
# ==============================================================================
SEED_CHECK=$(docker exec kidoku_db mariadb -u dev -ppass kidoku -N -e "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
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
# 10. 開発サーバー起動
# ==============================================================================
"$SCRIPT_DIR/dev-server.sh" start

# ==============================================================================
# 11. ヘルスチェック
# ==============================================================================
"$SCRIPT_DIR/health-check.sh"

green "サンドボックスセットアップ完了！"
