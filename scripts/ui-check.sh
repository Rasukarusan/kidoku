#!/usr/bin/env bash
# UI確認スクリプト — Playwright v1.50.0 でスクリーンショットを撮影
#
# 使い方:
#   bash scripts/ui-check.sh [パス1] [パス2] ...
#   bash scripts/ui-check.sh /                              # トップページ
#   bash scripts/ui-check.sh /testuser/sheets/本棚           # 認証付きページ
#   bash scripts/ui-check.sh --no-login /                   # ログインなしで撮影
#   bash scripts/ui-check.sh                                # デフォルトページ一覧を撮影
#
# 出力:
#   /tmp/kidoku/screenshots/<ファイル名>.png
#
# 注意:
#   - Claude Code on the Web 専用（Playwright v1.50.0 + headless Chromium）
#   - 開発サーバーが起動していない場合は自動起動する
#   - 裏口ログインが有効な環境を前提とする
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCREENSHOT_DIR="/tmp/kidoku/screenshots"
mkdir -p "$SCREENSHOT_DIR"

green() { echo -e "\033[32m✓ $*\033[0m"; }
yellow() { echo -e "\033[33m⏳ $*\033[0m"; }
red() { echo -e "\033[31m✗ $*\033[0m"; }

# ==============================================================================
# 引数パース
# ==============================================================================
LOGIN=true
PATHS=()

for arg in "$@"; do
  case "$arg" in
    --no-login) LOGIN=false ;;
    *) PATHS+=("$arg") ;;
  esac
done

# デフォルトページ
if [ ${#PATHS[@]} -eq 0 ]; then
  PATHS=("/")
fi

# ==============================================================================
# 1. Playwright v1.50.0 のパスを解決
# ==============================================================================
resolve_playwright() {
  # pnpm の node_modules から探す（サンドボックスではこちらが先にある場合がある）
  local pw_index=""

  # npx キャッシュから v1.50.0 を探す
  if [ -d /root/.npm/_npx ]; then
    pw_index=$(find /root/.npm/_npx -path "*/playwright/index.mjs" -exec \
      node -e "const p=require(process.argv[1].replace('/index.mjs','/package.json')); \
               if(p.version==='1.50.0') console.log(process.argv[1])" {} \; \
      2>/dev/null | head -1)
  fi

  if [ -n "$pw_index" ]; then
    echo "$pw_index"
    return 0
  fi

  # 見つからない場合はインストール
  yellow "Playwright v1.50.0 をインストール中..." >&2
  npx playwright@1.50.0 install chromium >&2 2>&1
  pw_index=$(find /root/.npm/_npx -path "*/playwright/index.mjs" -exec \
    node -e "const p=require(process.argv[1].replace('/index.mjs','/package.json')); \
             if(p.version==='1.50.0') console.log(process.argv[1])" {} \; \
    2>/dev/null | head -1)

  if [ -n "$pw_index" ]; then
    echo "$pw_index"
    return 0
  fi

  red "Playwright v1.50.0 が見つかりません" >&2
  return 1
}

# ==============================================================================
# 2. 開発サーバーの起動確認
# ==============================================================================
ensure_servers() {
  if curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
    return 0
  fi

  yellow "開発サーバーが停止しています。起動します..."
  bash "$SCRIPT_DIR/dev-server.sh" start

  # サーバーの準備完了を待つ（最大120秒）
  yellow "Web サーバーの起動を待機中..."
  for i in $(seq 1 120); do
    if curl -s -o /dev/null -w '' http://localhost:3000 2>/dev/null; then
      green "Web サーバー起動完了"
      return 0
    fi
    sleep 1
  done
  red "Web サーバーの起動がタイムアウトしました"
  return 1
}

# ==============================================================================
# 3. スクリーンショット撮影
# ==============================================================================
PW_INDEX=$(resolve_playwright)
green "Playwright: $PW_INDEX"

ensure_servers

# パスからファイル名を生成（/ → _root, /foo/bar → _foo_bar）
path_to_filename() {
  local p="$1"
  if [ "$p" = "/" ]; then
    echo "_root"
  else
    echo "$p" | sed 's|^/||; s|/|_|g; s|[^a-zA-Z0-9_-]|_|g'
  fi
}

# JSON配列を組み立て
PAGES_JSON="["
for i in "${!PATHS[@]}"; do
  p="${PATHS[$i]}"
  fname=$(path_to_filename "$p")
  if [ $i -gt 0 ]; then PAGES_JSON+=","; fi
  PAGES_JSON+="{\"path\":\"$p\",\"filename\":\"$fname\"}"
done
PAGES_JSON+="]"

# Playwright スクリプトを生成・実行
cat > /tmp/kidoku/ui-check.mjs << SCRIPT_EOF
import { chromium } from '${PW_INDEX}';

const pages = ${PAGES_JSON};
const login = ${LOGIN};
const screenshotDir = '${SCREENSHOT_DIR}';

const browser = await chromium.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-zygote',
  ],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});

// 外部フォント読み込みをブロック（タイムアウト防止）
await context.route('**/*.woff2', route => route.abort());
await context.route('**/*.woff', route => route.abort());
await context.route('**/fonts.googleapis.com/**', route => route.abort());
await context.route('**/fonts.gstatic.com/**', route => route.abort());

const page = await context.newPage();

// 裏口ログイン
if (login) {
  try {
    const csrfRes = await page.request.get('http://localhost:3000/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();
    await page.request.post('http://localhost:3000/api/auth/callback/backdoor', {
      form: { csrfToken, email: 'test@example.com' },
      maxRedirects: 0,
    });
    console.log('✓ ログイン完了');
  } catch (e) {
    console.error('⚠ ログイン失敗（--no-login で裏口ログインをスキップ可能）:', e.message);
  }
}

// 各ページのスクリーンショットを撮影
const results = [];
for (const { path: urlPath, filename } of pages) {
  const url = 'http://localhost:3000' + urlPath;
  const filepath = screenshotDir + '/' + filename + '.png';

  try {
    await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
    // ページの描画安定を待つ
    await page.waitForTimeout(3000);
    await page.screenshot({ path: filepath, fullPage: true, timeout: 10000 });
    console.log('✓ ' + urlPath + ' → ' + filepath);
    results.push({ path: urlPath, file: filepath, status: 'ok' });
  } catch (e) {
    console.error('✗ ' + urlPath + ' → ' + e.message);
    results.push({ path: urlPath, file: filepath, status: 'error', error: e.message });
  }
}

await browser.close();

// 結果サマリー
console.log('\n--- スクリーンショット結果 ---');
for (const r of results) {
  const icon = r.status === 'ok' ? '✓' : '✗';
  console.log(icon + ' ' + r.path + ' → ' + r.file);
}
SCRIPT_EOF

node /tmp/kidoku/ui-check.mjs
