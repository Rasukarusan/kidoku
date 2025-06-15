# NestJS API デプロイ手順

## 概要

このドキュメントは、kidoku APIをGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

1. Google Cloud Projectの作成
2. gcloud CLIのインストールと認証
3. 以下のAPIを有効化:
   - Cloud Run API
   - Container Registry API
   - Cloud Build API

## 初回セットアップ

### 1. サービスアカウントの作成

```bash
# サービスアカウント作成
gcloud iam service-accounts create kidoku-api-deployer \
  --display-name="Kidoku API Deployer"

# 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:kidoku-api-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:kidoku-api-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:kidoku-api-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"

# キーを生成
gcloud iam service-accounts keys create key.json \
  --iam-account=kidoku-api-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. GitHub Secretsの設定

以下のシークレットをGitHubリポジトリに設定:

- `GCP_PROJECT_ID`: Google CloudプロジェクトID
- `GCP_SA_KEY`: サービスアカウントキー（key.jsonの内容）
- `FRONTEND_URL`: フロントエンドのURL（例: https://kidoku.example.com）
- `DB_HOST`: TiDBクラウドのホスト
- `DB_PORT`: データベースポート
- `DB_USER`: データベースユーザー
- `DB_PASS`: データベースパスワード
- `DB_NAME`: データベース名
- `NEXTAUTH_SECRET`: NextAuth.jsのシークレット

## ローカルでのテスト

### Dockerイメージのビルドとテスト

```bash
# プロジェクトルートから実行
cd /path/to/kidoku

# イメージをビルド（プロジェクトルートから）
docker build -f Dockerfile.api -t kidoku-api:local .

# ローカルで実行
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=http://localhost:3000 \
  -e DB_HOST=localhost \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASS=password \
  -e DB_NAME=kidoku \
  -e NEXTAUTH_SECRET=your-secret \
  kidoku-api:local

# ヘルスチェック
curl http://localhost:4000/health
```

## デプロイ

### 自動デプロイ（推奨）

main/masterブランチに`apps/api/`配下の変更をプッシュすると、GitHub Actionsが自動的にデプロイします。

### 手動デプロイ

```bash
# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# イメージをビルドしてプッシュ
cd apps/api
docker build -t gcr.io/YOUR_PROJECT_ID/kidoku-api:latest .
docker push gcr.io/YOUR_PROJECT_ID/kidoku-api:latest

# Cloud Runにデプロイ
gcloud run deploy kidoku-api \
  --image gcr.io/YOUR_PROJECT_ID/kidoku-api:latest \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 4000 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60 \
  --set-env-vars "NODE_ENV=production,FRONTEND_URL=https://kidoku.example.com"
```

## 本番環境の確認

### サービスURLの取得

```bash
gcloud run services describe kidoku-api \
  --region asia-northeast1 \
  --format 'value(status.url)'
```

### ログの確認

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kidoku-api" \
  --limit 50 \
  --format json
```

### メトリクスの確認

Google Cloud Consoleから:

1. Cloud Run > kidoku-api を選択
2. METRICSタブで以下を確認:
   - リクエスト数
   - レスポンス時間
   - エラー率
   - CPU/メモリ使用率

## トラブルシューティング

### デプロイが失敗する場合

1. Cloud Buildのログを確認
2. 必要なAPIが有効化されているか確認
3. サービスアカウントの権限を確認

### 起動しない場合

1. Cloud Runのログを確認
2. 環境変数が正しく設定されているか確認
3. ヘルスチェックエンドポイント（/health）の応答を確認

### データベース接続エラー

1. TiDBクラウドのIP許可リストにCloud RunのIPを追加
2. SSL/TLS設定が正しいか確認（本番環境では自動的に有効化）

## 無料枠の監視

Cloud Runの無料枠使用状況を定期的に確認:

```bash
# 現在の使用量を確認
gcloud monitoring read \
  --filter='metric.type="run.googleapis.com/request_count"' \
  --format=table
```

月間の無料枠:

- CPU: 180,000 vCPU秒
- メモリ: 360,000 GiB秒
- リクエスト: 200万リクエスト