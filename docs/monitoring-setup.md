# 監視システムセットアップガイド

Kidokuの監視システムは、Prometheus + Grafanaを使用してアプリケーションのパフォーマンスと可用性を監視します。

## 構成要素

- **Prometheus**: メトリクス収集・保存
- **Grafana**: 可視化・ダッシュボード
- **Node Exporter**: システムメトリクス収集
- **アプリケーションメトリクス**: Next.js/NestJSのカスタムメトリクス

## セットアップ手順

### 1. 監視システムの起動

```bash
# Docker Composeで全サービスを起動
docker-compose up -d

# 監視サービスのみ起動する場合
docker-compose up -d prometheus grafana node-exporter
```

### 2. 各サービスへのアクセス

- **Grafana**: http://localhost:13000
  - 初期ユーザー名: `admin`
  - 初期パスワード: `admin`
- **Prometheus**: http://localhost:9090
- **Next.js メトリクス**: http://localhost:3000/api/metrics
- **NestJS メトリクス**: http://localhost:4000/metrics

### 3. Grafanaダッシュボード

起動時に自動的に以下のダッシュボードがプロビジョニングされます：

- **Kidoku Application Dashboard**: アプリケーション全体の監視
  - HTTPリクエストレート
  - レスポンスタイム（95パーセンタイル）
  - ステータスコード分布
  - AI分析リクエスト
  - 登録された本の総数
  - CPU使用率

## 収集されるメトリクス

### システムメトリクス
- CPU使用率
- メモリ使用率
- ディスク使用率
- ネットワークI/O

### アプリケーションメトリクス

#### Next.js
- `http_requests_total`: HTTPリクエスト総数
- `http_request_duration_seconds`: リクエスト処理時間
- `kidoku_active_users`: アクティブユーザー数
- `kidoku_books_registered_total`: 登録された本の総数
- `kidoku_ai_analysis_requests_total`: AI分析リクエスト数

#### NestJS API
- `http_requests_total`: HTTPリクエスト総数
- `http_request_duration_seconds`: リクエスト処理時間
- `graphql_requests_total`: GraphQLリクエスト総数
- `graphql_request_duration_seconds`: GraphQLリクエスト処理時間
- `database_query_duration_seconds`: データベースクエリ実行時間
- `ai_requests_total`: AI APIリクエスト数

## アラート設定

以下のアラートが設定されています：

1. **HighErrorRate**: 5xxエラー率が5%を超えた場合
2. **HighResponseTime**: 95パーセンタイルレスポンスタイムが1秒を超えた場合
3. **AIAnalysisFailureRate**: AI分析失敗率が20%を超えた場合
4. **ServiceDown**: サービスがダウンした場合
5. **HighCPUUsage**: CPU使用率が80%を超えた場合
6. **HighMemoryUsage**: メモリ使用率が85%を超えた場合

## カスタムメトリクスの追加

### Next.jsでメトリクスを追加する場合

```typescript
import { metricsHelpers } from '@/app/api/metrics/route'

// カウンターをインクリメント
metricsHelpers.incrementBooksRegistered()

// AI分析リクエストを記録
metricsHelpers.incrementAIAnalysisRequests('openai', 'success')
```

### NestJSでメトリクスを追加する場合

```typescript
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Counter } from 'prom-client'

constructor(
  @InjectMetric('custom_metric_name')
  private readonly customMetric: Counter<string>,
) {}

// メトリクスを記録
this.customMetric.inc({ label: 'value' })
```

## トラブルシューティング

### Grafanaがデータソースを見つけられない場合

1. Prometheusコンテナが起動しているか確認
   ```bash
   docker-compose ps prometheus
   ```

2. データソース設定にUIDが含まれているか確認
   ```bash
   cat docker/grafana/provisioning/datasources/prometheus.yml
   ```
   `uid: prometheus` が設定されていることを確認

3. Grafanaを再起動
   ```bash
   docker-compose restart grafana
   ```

### Prometheusがメトリクスを取得できない場合

1. ターゲットの状態を確認: http://localhost:9090/targets
2. `docker-compose logs prometheus` でエラーログを確認
3. ファイアウォール設定を確認

### Grafanaダッシュボードが表示されない場合

1. データソースの接続を確認: Grafana > Configuration > Data Sources
2. Prometheusが正常に動作しているか確認
3. `docker-compose restart grafana` で再起動

### メトリクスが収集されない場合

1. アプリケーションが正常に起動しているか確認
2. `/api/metrics` エンドポイントが応答するか確認
3. Prometheusの設定でスクレイプ間隔を確認