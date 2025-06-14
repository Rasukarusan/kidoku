# ビルドステージ
FROM node:22-alpine AS builder

# pnpmをインストール
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

# NestJSアプリケーションをビルド
RUN pnpm run build

# 本番ステージ
FROM node:22-alpine AS production

# pnpmをインストール
RUN corepack enable && corepack prepare pnpm@latest --activate

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-lock.yaml ./

# 本番用の依存関係のみインストール
RUN pnpm install --prod --frozen-lockfile

# ビルド済みのアプリケーションをコピー
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# ユーザーを切り替え
USER nestjs

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["node", "dist/main"]