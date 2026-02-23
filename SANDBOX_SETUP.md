# サンドボックス環境セットアップ手順

Claude Code のサンドボックス環境で Docker コンテナを立ち上げ、DB テーブルを作成するまでの手順書。

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
