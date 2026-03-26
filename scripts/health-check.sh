#!/usr/bin/env bash
# 開発環境のヘルスチェックスクリプト
# 各コンポーネントの正常性を確認し、結果をサマリー表示する
set -euo pipefail

green() { echo -e "\033[32m✓ $*\033[0m"; }
red() { echo -e "\033[31m✗ $*\033[0m"; }
yellow() { echo -e "\033[33m⚠ $*\033[0m"; }

PASS=0
FAIL=0
WARN=0

check_pass() { green "$1"; PASS=$((PASS + 1)); }
check_fail() { red "$1"; FAIL=$((FAIL + 1)); }
check_warn() { yellow "$1"; WARN=$((WARN + 1)); }

echo "=== Kidoku 開発環境ヘルスチェック ==="
echo ""

# --- Docker ---
echo "--- Docker ---"
if docker info &>/dev/null; then
  check_pass "Docker デーモン起動中"
else
  check_fail "Docker デーモンが起動していません"
fi

# --- MySQL ---
echo "--- MySQL ---"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^kidoku_db$'; then
  check_pass "MySQL コンテナ起動中"
  if docker exec kidoku_db mysql -u dev -ppass kidoku -e "SELECT 1" &>/dev/null; then
    check_pass "MySQL 接続可能"
    TABLE_COUNT=$(docker exec kidoku_db mysql -u dev -ppass kidoku -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='kidoku'" 2>/dev/null || echo "0")
    if [ "$TABLE_COUNT" -gt 0 ] 2>/dev/null; then
      check_pass "テーブル存在 ($TABLE_COUNT テーブル)"
    else
      check_fail "テーブルが存在しません (prisma db push が必要)"
    fi
    USER_COUNT=$(docker exec kidoku_db mysql -u dev -ppass kidoku -N -e "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
    if [ "$USER_COUNT" -gt 0 ] 2>/dev/null; then
      check_pass "シードデータ存在 (users: $USER_COUNT 件)"
    else
      check_warn "シードデータなし (seed 実行を推奨)"
    fi
  else
    check_fail "MySQL に接続できません"
  fi
else
  check_fail "MySQL コンテナが起動していません"
fi

# --- MeiliSearch ---
echo "--- MeiliSearch ---"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'meilisearch'; then
  check_pass "MeiliSearch コンテナ起動中"
  if curl -s -o /dev/null -w '%{http_code}' http://localhost:7700/health 2>/dev/null | grep -q '200'; then
    check_pass "MeiliSearch ヘルスチェック OK"
  else
    check_warn "MeiliSearch がまだ起動準備中の可能性あり"
  fi
else
  check_fail "MeiliSearch コンテナが起動していません"
fi

# --- API サーバー ---
echo "--- API サーバー (NestJS) ---"
API_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' 2>/dev/null || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
  check_pass "API サーバー応答 (HTTP $API_RESPONSE)"
  # 認証付きクエリテスト
  AUTH_RESULT=$(node -e "
const crypto = require('crypto');
const http = require('http');
const secret = 'kidoku-local-nextauth-secret';
const userId = 'test-user-id';
const ts = Date.now().toString();
const sig = crypto.createHmac('sha256', secret)
  .update(userId + ':false:' + ts).digest('hex');
const req = http.request('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId, 'x-user-admin': 'false',
    'x-timestamp': ts, 'x-signature': sig,
  },
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(res.statusCode));
});
req.write(JSON.stringify({ query: '{ sheets { id } }' }));
req.end();
" 2>/dev/null || echo "error")
  if [ "$AUTH_RESULT" = "200" ]; then
    check_pass "認証付き GraphQL クエリ OK"
  else
    check_warn "認証付きクエリが失敗 (シードデータ未投入の可能性)"
  fi
else
  check_fail "API サーバーが応答しません (HTTP $API_RESPONSE)"
fi

# --- Web サーバー ---
echo "--- Web サーバー (Next.js) ---"
WEB_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo "000")
if [ "$WEB_RESPONSE" = "200" ]; then
  check_pass "Web サーバー応答 (HTTP $WEB_RESPONSE)"
else
  check_fail "Web サーバーが応答しません (HTTP $WEB_RESPONSE)"
fi

# --- サマリー ---
echo ""
echo "=== サマリー ==="
TOTAL=$((PASS + FAIL + WARN))
echo "合計: $TOTAL チェック / ✓ $PASS 成功 / ✗ $FAIL 失敗 / ⚠ $WARN 警告"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  red "一部のチェックが失敗しました。上記の詳細を確認してください。"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo ""
  yellow "警告がありますが、基本的な動作は可能です。"
  exit 0
else
  echo ""
  green "すべてのチェックに成功しました！"
  exit 0
fi
