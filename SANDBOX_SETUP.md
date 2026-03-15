# サンドボックス環境セットアップ手順

[Claude Code on the Web](https://code.claude.com/docs/ja/claude-code-on-the-web) のクラウドサンドボックス環境で Docker コンテナを立ち上げ、DB テーブルを作成するまでの手順書。

> **注意**: この手順は Claude Code on the Web（クラウドVM）専用です。ローカル開発では docker-compose を使ってください。

## 自動セットアップ（推奨）

SessionStart Hook により、Claude Code on the Web のセッション開始時に環境が自動構築されます。
スクリプトは環境変数 `CLAUDE_CODE_REMOTE=true`（クラウドVM内で自動設定）を検出して実行されます。

手動で実行する場合:

```bash
# クラウドVM内（CLAUDE_CODE_REMOTE=true なら自動判定）
bash scripts/sandbox-setup.sh

# ローカルで強制実行する場合
SANDBOX=1 bash scripts/sandbox-setup.sh
```

### 個別スクリプト

| スクリプト | 用途 |
|---|---|
| `scripts/sandbox-setup.sh` | 環境の一括セットアップ（Docker・DB・シード・サーバー起動） |
| `scripts/dev-server.sh start\|stop\|restart\|status\|logs` | 開発サーバーの管理 |
| `scripts/health-check.sh` | 全コンポーネントのヘルスチェック |

### AI Agent 自律開発の仕組み

- **`.claude/hooks.json`**: SessionStart Hook でセッション開始時に `sandbox-setup.sh` を自動実行
- **`.claude/settings.json`**: Docker・Prisma・curl 等のコマンドを事前許可し、agent の自律動作を阻害しない
- **`.mcp.json`**: Playwright / Chrome DevTools MCP でブラウザ操作による動作確認が可能

### 環境判別

| 環境変数 | 値 | 設定元 |
|---|---|---|
| `CLAUDE_CODE_REMOTE` | `"true"` | Claude Code on the Web が自動設定 |
| `CLAUDE_PROJECT_DIR` | プロジェクトルートパス | Claude Code on the Web が自動設定 |

詳細: https://code.claude.com/docs/ja/claude-code-on-the-web

## 手動セットアップ（詳細手順）

## 前提

- Docker コマンドはプリインストール済み（Docker 29.2.1）
- カーネルが古い（Linux 4.4.0）ため `nftables` 非対応
- ネットワークは egress プロキシ経由（ホワイトリスト方式）

## 手順

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 環境変数ファイルの準備

```bash
cp .env.example .env
```

`.env` の DB 関連を以下のように変更する（サンドボックスではホストネットワーク上の `3306` を使用）:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=dev
DB_PASS=pass
DB_NAME=kidoku
DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku"
```

### 3. iptables を legacy に切り替え

nftables がカーネル非対応のため:

```bash
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
```

### 4. Docker デーモンを起動

```bash
sudo -E dockerd --iptables=false --bridge=none --storage-driver=vfs &>/tmp/dockerd.log &
sleep 5
docker info  # 起動確認
```

### 5. DB コンテナ起動（MariaDB）

MySQL イメージは pull 不可のため MariaDB で代替する。`--network=host` 必須。

```bash
docker run -d --name kidoku_db --network=host \
  -e MARIADB_ROOT_PASSWORD=pass \
  -e MARIADB_DATABASE=kidoku \
  -e MARIADB_USER=dev \
  -e MARIADB_PASSWORD=pass \
  mariadb:lts
```

### 6. MeiliSearch コンテナ起動

```bash
docker run -d --name kidoku_meilisearch --network=host \
  -e MEILI_HTTP_ADDR=0.0.0.0:7700 \
  -e MEILI_MASTER_KEY=YourMasterKey \
  getmeili/meilisearch:prototype-japanese-6
```

### 7. コンテナ起動確認

```bash
sleep 15 && docker ps
```

MariaDB と MeiliSearch の両方が `Up` になっていることを確認。

### 8. DB テーブル作成（Prisma db push）

Prisma スキーマを DB に反映してテーブルを作成する。
`DATABASE_URL` に Accelerate URL が設定されている場合は、環境変数で直接接続先を上書きする。

```bash
DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku" \
  npx prisma db push --schema=apps/web/prisma/schema.prisma
```

### 9. テーブル作成確認

```bash
docker exec kidoku_db mariadb -u dev -ppass kidoku -e "SHOW TABLES;"
```

以下のテーブルが作成されていれば成功:

| テーブル名 |
|---|
| accounts |
| ai_summaries |
| books |
| sessions |
| sheets |
| template_books |
| users |
| verificationtokens |
| yearly_top_books |

### 10. シードデータ投入（オプション）

開発用のサンプルデータを投入する。テストユーザー・本棚・書籍（19冊）・年間ベスト・AI要約・テンプレートが作成される。

```bash
DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku" \
  npx tsx apps/web/prisma/seed.ts
```

### 11. 各アプリの環境変数ファイルを作成

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

`apps/web/.env` を編集:

```
DATABASE_URL=mysql://dev:pass@localhost:3306/kidoku
NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true
BACKDOOR_USER_EMAIL=test@example.com
```

`apps/api/.env` を編集:

```
DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku"
MEILI_HOST=http://localhost:7700
```

### 12. Prisma クライアント生成

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma@5 generate --schema=apps/web/prisma/schema.prisma
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma@5 generate --schema=apps/api/prisma/schema.prisma
```

### 13. 開発サーバー起動

**バックエンド（NestJS API）**:

```bash
pnpm --filter api dev
```

`🚀 NestJS ready: http://localhost:4000` が表示されれば成功。

**フロントエンド（Next.js）**:

```bash
pnpm --filter web dev
```

`✓ Ready` が表示されれば成功。

### 14. 動作確認

**フロントエンド**:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# → 200 が返れば OK
```

**バックエンド（認証なし）**:

```bash
curl -s http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
# → {"data":{"__typename":"Query"}} が返れば OK
```

**バックエンド（認証付きでデータ取得）**:

GraphQL の `sheets` / `books` クエリは HMAC-SHA256 署名が必要。
以下のスクリプトでテストユーザーの作成からデータ取得まで確認できる（手順10でseed実行済みの場合、手順1・2はスキップ可）。

```bash
# 1. テストユーザー作成
docker exec kidoku_db mariadb -u dev -ppass kidoku -e "
  INSERT IGNORE INTO users (id, name, email, admin)
  VALUES ('test-user-id', 'testuser', 'test@example.com', 0);
"

# 2. テストデータ投入（シート＋本）
docker exec kidoku_db mariadb -u dev -ppass kidoku -e "
  INSERT IGNORE INTO sheets (id, user_id, name, \`order\`)
  VALUES (1, 'test-user-id', 'テスト本棚', 1);
  INSERT IGNORE INTO books (id, user_id, sheet_id, title, author, category, image, impression, memo, is_public_memo, is_purchasable, created, updated)
  VALUES (1, 'test-user-id', 1, 'リーダブルコード', 'Dustin Boswell', '技術書', 'https://example.com/image.jpg', '5', 'テストメモ', 0, 0, NOW(), NOW());
"

# 3. 署名付き GraphQL クエリで取得
node -e "
const crypto = require('crypto');
const http = require('http');
const secret = 'kidoku-local-nextauth-secret';
const userId = 'test-user-id';
const isAdmin = 'false';

function query(label, body) {
  return new Promise((resolve) => {
    const ts = Date.now().toString();
    const sig = crypto.createHmac('sha256', secret)
      .update(userId + ':' + isAdmin + ':' + ts).digest('hex');
    const req = http.request('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId, 'x-user-admin': isAdmin,
        'x-timestamp': ts, 'x-signature': sig,
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { console.log(label + ':', d); resolve(); });
    });
    req.write(body); req.end();
  });
}

(async () => {
  await query('sheets', JSON.stringify({ query: '{ sheets { id name } }' }));
  await query('books',  JSON.stringify({ query: '{ books { id title author } }' }));
})();
"
# → sheets: {"data":{"sheets":[{"id":"1","name":"テスト本棚"}]}}
# → books:  {"data":{"books":[{"id":"1","title":"リーダブルコード","author":"Dustin Boswell"}]}}
```

## 裏口ログイン（Playwright でのセッション取得）

サンドボックス環境ではGoogle OAuthが使えないため、裏口ログイン（CredentialsProvider）でセッションを取得する。
`apps/web/.env` に `NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true` と `BACKDOOR_USER_EMAIL=test@example.com` が設定されている前提。

### curl でのログイン

```bash
# 1. CSRFトークン取得
CSRF_TOKEN=$(curl -s -c /tmp/cookies.txt http://localhost:3000/api/auth/csrf | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).csrfToken))")

# 2. 裏口ログイン実行（セッションCookieが /tmp/cookies.txt に保存される）
curl -s -b /tmp/cookies.txt -c /tmp/cookies.txt \
  -X POST http://localhost:3000/api/auth/callback/backdoor \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=${CSRF_TOKEN}&email=test@example.com" \
  -o /dev/null -w "Login: %{http_code}\n"
# → Login: 302 が返ればログイン成功

# 3. 認証付きで GraphQL クエリ（プロキシ経由）
curl -s -b /tmp/cookies.txt \
  -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ books { id title } }"}'
# → {"data":{"books":[...]}} が返れば OK
```

### Playwright でのログイン付きスクリーンショット

```bash
PW_INDEX=$(find /root/.npm/_npx -path "*/playwright/index.mjs" -exec \
  node -e "const p=require(process.argv[1].replace('/index.mjs','/package.json')); \
           if(p.version==='1.50.0') console.log(process.argv[1])" {} \; \
  | head -1)

cat > /tmp/screenshot_login.mjs << SCRIPT_EOF
import { chromium } from '${PW_INDEX}';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--single-process', '--no-zygote']
});
const context = await browser.newContext();
const page = await context.newPage();

// ログイン
const csrfRes = await page.request.get('http://localhost:3000/api/auth/csrf');
const { csrfToken } = await csrfRes.json();
await page.request.post('http://localhost:3000/api/auth/callback/backdoor', {
  form: { csrfToken, email: 'test@example.com' },
  maxRedirects: 0,
});

// シートページ（ログイン済み）
await page.goto('http://localhost:3000/testuser/sheets/本棚', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: '/home/user/kidoku/screenshot_sheet.png', fullPage: true });
console.log('Sheet screenshot saved');

await browser.close();
SCRIPT_EOF

node /tmp/screenshot_login.mjs
```

## 環境の再起動

セッションが切れてコンテナや開発サーバーが停止した場合の再起動手順。

### 1. Docker デーモン起動

```bash
sudo -E dockerd --iptables=false --bridge=none --storage-driver=vfs &>/tmp/dockerd.log &
sleep 5 && docker info
```

### 2. コンテナ再起動

既存コンテナが残っている場合は `start`、なければ `run` で再作成する。

```bash
# 既存コンテナの再起動を試みる
docker start kidoku_db kidoku_meilisearch 2>/dev/null || {
  echo "コンテナが存在しないため再作成..."
  docker run -d --name kidoku_db --network=host \
    -e MARIADB_ROOT_PASSWORD=pass \
    -e MARIADB_DATABASE=kidoku \
    -e MARIADB_USER=dev \
    -e MARIADB_PASSWORD=pass \
    mariadb:lts
  docker run -d --name kidoku_meilisearch --network=host \
    -e MEILI_HTTP_ADDR=0.0.0.0:7700 \
    -e MEILI_MASTER_KEY=YourMasterKey \
    getmeili/meilisearch:prototype-japanese-6
}
sleep 15 && docker ps
```

> **注意**: コンテナの `start` が失敗する場合（`Error: No such container`）は、先に `docker rm -f kidoku_db kidoku_meilisearch` してから `docker run` で再作成する。

### 3. DB テーブル・データ確認

```bash
# テーブルが存在するか確認
docker exec kidoku_db mariadb -u dev -ppass kidoku -e "SHOW TABLES;"

# テーブルがなければ再作成
DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku" \
  npx prisma db push --schema=apps/web/prisma/schema.prisma

# データがなければシード再投入
DATABASE_URL="mysql://dev:pass@localhost:3306/kidoku" \
  npx tsx apps/web/prisma/seed.ts
```

### 4. 開発サーバー起動

```bash
# バックエンド
pnpm --filter api dev > /tmp/api.log 2>&1 &
sleep 10 && tail -3 /tmp/api.log

# フロントエンド
pnpm --filter web dev > /tmp/web.log 2>&1 &
sleep 20 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# → 200 が返れば OK
```

## 制限事項

| 項目 | 状況 |
|---|---|
| Docker デーモン起動 | `--iptables=false --bridge=none --storage-driver=vfs` で可能 |
| Docker Hub 接続 | プロキシ経由で到達可能 |
| イメージ pull（Alpine系） | **可能**（alpine, node:20-alpine, mariadb:lts, meilisearch等） |
| イメージ pull（非Alpine系） | **不可**（mysql:9.3等はレイヤー展開時に`operation not permitted`） |
| `docker compose up` | overlayfsの制限により不可。`docker run`で個別起動すること |
| ブリッジネットワーク | 無効化しているため `--network=host` が必要 |
| MySQL | pull不可のため **MariaDB（`mariadb:lts`）で代替**すること |

## Playwright MCP が使用できない場合のスクリーンショット撮影

### 初回のみ: Playwright とブラウザのインストール

```bash
npx playwright@1.50.0 install chromium
```

### スクリーンショット撮影

`npx` キャッシュのパスはインストール時に変わるため、`find` で動的に解決する。

```bash
PW_INDEX=$(find /root/.npm/_npx -path "*/playwright/index.mjs" -exec \
  node -e "const p=require(process.argv[1].replace('/index.mjs','/package.json')); \
           if(p.version==='1.50.0') console.log(process.argv[1])" {} \; \
  | head -1)

cat > /tmp/screenshot.mjs << EOF
import { chromium } from '${PW_INDEX}';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--single-process', '--no-zygote']
});
const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
await page.screenshot({ path: '/home/user/kidoku/screenshot.png', fullPage: true });
console.log('Screenshot saved');
await browser.close();
EOF

node /tmp/screenshot.mjs
```

## 注意事項

- **外部サービスへの接続制限**: Google Fonts、Prisma Accelerate等への接続がブロックされる場合がある
- **ページ表示エラー**: DB接続エラーはサンドボックスのネットワーク制限が原因の場合があり、コード自体の問題ではない
- **`pnpm dev`の起動確認**: TypeScriptコンパイルエラー0件、Next.js/NestJSの起動成功メッセージで判断する
