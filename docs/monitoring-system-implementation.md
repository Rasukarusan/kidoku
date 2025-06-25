# 監視システム実装ガイド

このドキュメントでは、Kidokuアプリケーションに実装した監視システムの詳細について説明します。

## 概要

Kidokuの監視システムは、Prometheus + Grafanaを基盤として構築されており、アプリケーションのパフォーマンス、可用性、エラー率などを可視化・監視します。

## アーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │     │   NestJS API    │     │  Node Exporter  │
│ /api/metrics    │     │    /metrics     │     │   :9100         │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │   Prometheus   │
                         │     :9090      │
                         └───────┬────────┘
                                 │
                         ┌───────▼────────┐
                         │    Grafana     │
                         │     :13000      │
                         └────────────────┘
```

## コンポーネント詳細

### 1. Prometheus

メトリクスの収集と保存を担当するモニタリングシステムです。

**設定ファイル**: `docker/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s      # メトリクス収集間隔
  evaluation_interval: 15s   # ルール評価間隔

scrape_configs:
  - job_name: 'kidoku-web'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/api/metrics'
    
  - job_name: 'kidoku-api'
    static_configs:
      - targets: ['host.docker.internal:4000']
    metrics_path: '/metrics'
```

### 2. Grafana

メトリクスの可視化とダッシュボード機能を提供します。

**アクセス情報**:
- URL: http://localhost:13000
- 初期ユーザー名: admin
- 初期パスワード: admin

**自動プロビジョニング**:
- データソース: `docker/grafana/provisioning/datasources/prometheus.yml`
- ダッシュボード: `docker/grafana/provisioning/dashboards/kidoku-dashboard.json`

### 3. Node Exporter

システムレベルのメトリクス（CPU、メモリ、ディスク使用率など）を収集します。

## 実装詳細

### Next.js アプリケーション

#### 1. メトリクスエンドポイント

**ファイル**: `apps/web/src/app/api/metrics/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { register, collectDefaultMetrics } from 'prom-client'

// デフォルトメトリクスの収集
collectDefaultMetrics({ register })

export async function GET() {
  const metrics = await register.metrics()
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  })
}
```

#### 2. カスタムメトリクス

**ファイル**: `apps/web/src/lib/metrics.ts`

実装されているメトリクス:
- `http_requests_total`: HTTPリクエストの総数
- `http_request_duration_seconds`: リクエスト処理時間
- `kidoku_active_users`: アクティブユーザー数
- `kidoku_books_registered_total`: 登録された本の総数
- `kidoku_ai_analysis_requests_total`: AI分析リクエスト数

#### 3. ミドルウェア

**ファイル**: `apps/web/src/middleware.ts`

HTTPリクエストを自動的に計測し、メトリクスを収集します。

### NestJS API

#### 1. メトリクスモジュール

**ファイル**: `apps/api/src/modules/metrics/metrics.module.ts`

```typescript
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  // ...
})
```

#### 2. メトリクスインターセプター

**ファイル**: `apps/api/src/common/interceptors/metrics.interceptor.ts`

すべてのHTTPリクエストを自動的に計測します。

#### 3. カスタムメトリクス

実装されているメトリクス:
- `graphql_requests_total`: GraphQLリクエスト数
- `graphql_request_duration_seconds`: GraphQL処理時間
- `database_query_duration_seconds`: データベースクエリ時間
- `ai_requests_total`: AI APIリクエスト数

## ダッシュボード

### Kidoku Application Dashboard

以下のパネルが含まれています:

1. **HTTP Request Rate**: HTTPリクエストレート
2. **Response Time (95th percentile)**: 95パーセンタイルレスポンスタイム
3. **Response Status Codes**: ステータスコード分布
4. **AI Analysis Requests**: AI分析リクエスト
5. **Total Books Registered**: 登録された本の総数
6. **CPU Usage**: CPU使用率

## アラート設定

**ファイル**: `docker/prometheus/alert_rules.yml`

設定されているアラート:

| アラート名 | 条件 | 重要度 |
|----------|------|-------|
| HighErrorRate | 5xxエラー率 > 5% | critical |
| HighResponseTime | 95%タイル応答時間 > 1秒 | warning |
| AIAnalysisFailureRate | AI分析失敗率 > 20% | warning |
| ServiceDown | サービス停止 | critical |
| HighCPUUsage | CPU使用率 > 80% | warning |
| HighMemoryUsage | メモリ使用率 > 85% | warning |

## 使用方法

### メトリクスの追加

#### Next.jsでカスタムメトリクスを追加する場合:

```typescript
import { metricsHelpers } from '@/lib/metrics'

// 本の登録時
metricsHelpers.incrementBooksRegistered()

// AI分析実行時
try {
  const result = await analyzeWithAI()
  metricsHelpers.incrementAIAnalysisRequests('openai', 'success')
} catch (error) {
  metricsHelpers.incrementAIAnalysisRequests('openai', 'failure')
  throw error
}
```

#### NestJSでカスタムメトリクスを追加する場合:

```typescript
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Counter } from 'prom-client'

@Injectable()
export class MyService {
  constructor(
    @InjectMetric('my_custom_metric')
    private readonly customMetric: Counter<string>,
  ) {}

  async doSomething() {
    this.customMetric.inc({ label: 'value' })
  }
}
```

### 新しいダッシュボードの作成

1. Grafanaにログイン
2. Create > Dashboard
3. Add panel
4. Query設定でPrometheusを選択
5. メトリクスを選択して可視化

### アラートの追加

1. `docker/prometheus/alert_rules.yml`を編集
2. 新しいアラートルールを追加
3. Prometheusを再起動

## トラブルシューティング

### メトリクスが表示されない

1. エンドポイントの確認
   ```bash
   curl http://localhost:3000/api/metrics
   curl http://localhost:4000/metrics
   ```

2. Prometheusターゲットの状態確認
   - http://localhost:9090/targets

3. ログの確認
   ```bash
   docker-compose logs prometheus
   docker-compose logs grafana
   ```

### Grafanaにログインできない

初期パスワードをリセット:
```bash
docker-compose exec grafana grafana-cli admin reset-admin-password newpassword
```

### メトリクスの保存期間

デフォルトでは15日間保存されます。変更する場合は、Prometheusの起動コマンドに以下を追加:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'
```

## ベストプラクティス

### 1. メトリクス命名規則

- 単位を含める: `_seconds`, `_bytes`, `_total`
- アンダースコアで単語を区切る
- 名前空間を使用: `kidoku_feature_metric`

### 2. ラベルの使用

- カーディナリティに注意（ユニークな値が多すぎない）
- 固定的な値を使用（status: "success"/"failure"など）

### 3. メトリクスタイプの選択

- カウンター: 増加のみする値（リクエスト数など）
- ゲージ: 増減する値（アクティブユーザー数など）
- ヒストグラム: 分布を測定（レスポンスタイムなど）

### 4. パフォーマンスへの配慮

- メトリクス収集は非同期で実行
- エラーが発生してもアプリケーションに影響しない
- 適切なスクレイプ間隔の設定（デフォルト15秒）

## セキュリティ考慮事項

1. **アクセス制限**: 本番環境ではメトリクスエンドポイントへのアクセスを制限
2. **認証**: Grafanaのデフォルトパスワードを変更
3. **機密情報**: メトリクスに個人情報やセキュリティ情報を含めない

## 今後の拡張可能性

1. **アラートマネージャー**: Prometheusアラートの通知設定
2. **ログ収集**: Loki等によるログ管理
3. **分散トレーシング**: Jaeger等によるトレース収集
4. **カスタムエクスポーター**: 外部サービスのメトリクス収集

## 参考リンク

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)