#!/usr/bin/env bash
# 軽量リカバリスクリプト — 個別コンポーネントの問題を自動検出・修復
#
# 使い方:
#   bash scripts/auto-fix.sh          # 全コンポーネントを自動診断・修復
#   bash scripts/auto-fix.sh db       # DB のみ修復
#   bash scripts/auto-fix.sh meili    # MeiliSearch のみ修復
#   bash scripts/auto-fix.sh api      # API サーバーのみ修復
#   bash scripts/auto-fix.sh web      # Web サーバーのみ修復
#   bash scripts/auto-fix.sh servers  # API + Web サーバーを修復
#
# sandbox-setup.sh のフル再セットアップ（数分）を回避し、
# 壊れたコンポーネントだけをピンポイントで修復する。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="/tmp/kidoku"
mkdir -p "$LOG_DIR"

green() { echo -e "\033[32m✓ $*\033[0m"; }
yellow() { echo -e "\033[33m⏳ $*\033[0m"; }
red() { echo -e "\033[31m✗ $*\033[0m"; }

FIXED=0
FAILED=0

# ==============================================================================
# Docker デーモン修復
# ==============================================================================
fix_docker() {
  if docker info &>/dev/null; then
    green "Docker: 正常"
    return 0
  fi
  yellow "Docker デーモンを起動中..."
  if command -v update-alternatives &>/dev/null; then
    sudo update-alternatives --set iptables /usr/sbin/iptables-legacy 2>/dev/null || true
    sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy 2>/dev/null || true
  fi
  sudo -E dockerd --iptables=false --bridge=none --storage-driver=vfs &>"$LOG_DIR/dockerd.log" &
  for i in $(seq 1 30); do
    if docker info &>/dev/null; then
      green "Docker: 修復完了"
      FIXED=$((FIXED + 1))
      return 0
    fi
    sleep 1
  done
  red "Docker: 修復失敗（ログ: $LOG_DIR/dockerd.log）"
  FAILED=$((FAILED + 1))
  return 1
}

# ==============================================================================
# MariaDB 修復
# ==============================================================================
fix_db() {
  # Docker が必要
  if ! docker info &>/dev/null; then
    fix_docker || return 1
  fi

  if docker exec kidoku_db mariadb -u dev -ppass kidoku -e "SELECT 1" &>/dev/null; then
    green "MariaDB: 正常"
    return 0
  fi

  # コンテナが存在するが停止している場合
  if docker ps -a --format '{{.Names}}' | grep -q '^kidoku_db$'; then
    yellow "MariaDB コンテナを再起動中..."
    docker start kidoku_db
  else
    yellow "MariaDB コンテナを作成中..."
    docker run -d --name kidoku_db --network=host \
      -e MARIADB_ROOT_PASSWORD=pass \
      -e MARIADB_DATABASE=kidoku \
      -e MARIADB_USER=dev \
      -e MARIADB_PASSWORD=pass \
      mariadb:lts
  fi

  # 接続待ち
  for i in $(seq 1 30); do
    if docker exec kidoku_db mariadb -u dev -ppass kidoku -e "SELECT 1" &>/dev/null; then
      green "MariaDB: 修復完了"
      FIXED=$((FIXED + 1))

      # テーブルが存在するか確認
      TABLE_COUNT=$(docker exec kidoku_db mariadb -u dev -ppass kidoku -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='kidoku'" 2>/dev/null || echo "0")
      if [ "$TABLE_COUNT" -eq 0 ] 2>/dev/null; then
        yellow "テーブルが存在しません。Prisma db push を実行中..."
        cd "$PROJECT_ROOT"
        DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku" pnpm --filter web exec prisma db push --skip-generate 2>"$LOG_DIR/prisma-push.log"
        green "Prisma db push 完了"
      fi

      # ユーザーが存在するか確認
      USER_COUNT=$(docker exec kidoku_db mariadb -u dev -ppass kidoku -N -e "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
      if [ "$USER_COUNT" -eq 0 ] 2>/dev/null; then
        yellow "シードデータを投入中..."
        cd "$PROJECT_ROOT"
        DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku" node scripts/sandbox-seed.js 2>"$LOG_DIR/seed.log" || true
        green "シードデータ投入完了"
      fi

      return 0
    fi
    sleep 1
  done
  red "MariaDB: 修復失敗"
  FAILED=$((FAILED + 1))
  return 1
}

# ==============================================================================
# MeiliSearch 修復
# ==============================================================================
fix_meili() {
  if ! docker info &>/dev/null; then
    fix_docker || return 1
  fi

  if curl -s -o /dev/null -w '%{http_code}' http://localhost:7700/health 2>/dev/null | grep -q '200'; then
    green "MeiliSearch: 正常"
    return 0
  fi

  if docker ps -a --format '{{.Names}}' | grep -q '^kidoku_meilisearch$'; then
    yellow "MeiliSearch コンテナを再起動中..."
    docker start kidoku_meilisearch
  else
    yellow "MeiliSearch コンテナを作成中..."
    docker run -d --name kidoku_meilisearch --network=host \
      -e MEILI_HTTP_ADDR=0.0.0.0:7700 \
      -e MEILI_MASTER_KEY=YourMasterKey \
      getmeili/meilisearch:prototype-japanese-6
  fi

  for i in $(seq 1 20); do
    if curl -s -o /dev/null -w '%{http_code}' http://localhost:7700/health 2>/dev/null | grep -q '200'; then
      green "MeiliSearch: 修復完了"
      FIXED=$((FIXED + 1))
      return 0
    fi
    sleep 1
  done
  red "MeiliSearch: 修復失敗"
  FAILED=$((FAILED + 1))
  return 1
}

# ==============================================================================
# API サーバー修復
# ==============================================================================
fix_api() {
  if curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}' 2>/dev/null | grep -q '200'; then
    green "API サーバー: 正常"
    return 0
  fi

  yellow "API サーバーを再起動中..."
  bash "$SCRIPT_DIR/dev-server.sh" stop 2>/dev/null || true
  # DB が必要
  fix_db 2>/dev/null || true

  bash "$SCRIPT_DIR/dev-server.sh" start
  if curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}' 2>/dev/null | grep -q '200'; then
    green "API サーバー: 修復完了"
    FIXED=$((FIXED + 1))
    return 0
  fi
  red "API サーバー: 修復失敗（ログ: /tmp/kidoku/api.log）"
  FAILED=$((FAILED + 1))
  return 1
}

# ==============================================================================
# Web サーバー修復
# ==============================================================================
fix_web() {
  if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null | grep -q '200'; then
    green "Web サーバー: 正常"
    return 0
  fi

  yellow "Web サーバーを再起動中..."
  bash "$SCRIPT_DIR/dev-server.sh" stop 2>/dev/null || true
  bash "$SCRIPT_DIR/dev-server.sh" start
  if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null | grep -q '200'; then
    green "Web サーバー: 修復完了"
    FIXED=$((FIXED + 1))
    return 0
  fi
  red "Web サーバー: 修復失敗（ログ: /tmp/kidoku/web.log）"
  FAILED=$((FAILED + 1))
  return 1
}

# ==============================================================================
# メイン
# ==============================================================================
TARGET="${1:-all}"

echo "=== Kidoku 自動修復 ==="
echo ""

case "$TARGET" in
  db)      fix_db ;;
  meili)   fix_meili ;;
  api)     fix_api ;;
  web)     fix_web ;;
  servers) fix_api; fix_web ;;
  all)
    fix_docker
    fix_db
    fix_meili
    fix_api
    fix_web
    ;;
  *)
    red "不明なターゲット: $TARGET"
    echo "Usage: $0 {all|db|meili|api|web|servers}"
    exit 1
    ;;
esac

echo ""
echo "=== 結果: 修復 $FIXED 件 / 失敗 $FAILED 件 ==="
if [ "$FAILED" -gt 0 ]; then
  red "一部の修復に失敗しました。bash scripts/sandbox-setup.sh でフル再セットアップを試してください。"
  exit 1
fi
