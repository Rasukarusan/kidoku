#!/usr/bin/env bash
# E2Eテスト実行スクリプト（sandbox環境対応）
#
# 使い方:
#   bash scripts/e2e-test.sh                    # 全E2Eテスト実行
#   bash scripts/e2e-test.sh auth               # 特定テストファイルのみ
#   bash scripts/e2e-test.sh navigation search  # 複数指定
#
# 出力:
#   テスト結果はコンソールに表示
#   HTMLレポート: apps/web/playwright-report/index.html
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

green() { echo -e "\033[32m✓ $*\033[0m"; }
yellow() { echo -e "\033[33m⏳ $*\033[0m"; }
red() { echo -e "\033[31m✗ $*\033[0m"; }

# ==============================================================================
# 1. 開発サーバー起動確認
# ==============================================================================
if ! curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
  yellow "開発サーバーが停止しています。起動します..."
  bash "$SCRIPT_DIR/dev-server.sh" start
fi

if ! curl -s -o /dev/null -w '' http://localhost:4000/graphql 2>/dev/null; then
  red "API サーバーが応答しません。bash scripts/dev-server.sh restart を試してください。"
  exit 1
fi
green "開発サーバー起動確認完了"

# ==============================================================================
# 2. Playwright のインストール確認
# ==============================================================================
CHROMIUM_PATH="${CHROMIUM_PATH:-/root/.cache/ms-playwright/chromium-1155/chrome-linux/chrome}"
if [ ! -f "$CHROMIUM_PATH" ]; then
  yellow "Playwright Chromium をインストール中..."
  cd "$PROJECT_ROOT/apps/web"
  npx playwright install chromium 2>/dev/null || {
    red "Chromium のインストールに失敗しました"
    exit 1
  }
  green "Chromium インストール完了"
fi

# ==============================================================================
# 3. テスト実行
# ==============================================================================
cd "$PROJECT_ROOT"

# テストファイル指定がある場合
TEST_FILES=()
for arg in "$@"; do
  # .spec.ts がなければ補完
  if [[ "$arg" == *.spec.ts ]]; then
    TEST_FILES+=("e2e/$arg")
  else
    TEST_FILES+=("e2e/${arg}.spec.ts")
  fi
done

yellow "E2E テストを実行中..."
if [ ${#TEST_FILES[@]} -gt 0 ]; then
  echo "  対象: ${TEST_FILES[*]}"
  SANDBOX=1 pnpm --filter web exec playwright test "${TEST_FILES[@]}" --reporter=list
else
  SANDBOX=1 pnpm --filter web exec playwright test --reporter=list
fi

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  green "E2E テスト全件成功"
else
  red "E2E テスト失敗 (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
