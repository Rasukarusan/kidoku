# 監視システムクイックリファレンス

## 🚀 クイックスタート

```bash
# 監視システムの起動
docker-compose up -d prometheus grafana node-exporter

# 状態確認
docker-compose ps

# ログ確認
docker-compose logs -f prometheus
```

## 📊 アクセスURL

| サービス | URL | 認証情報 |
|---------|-----|---------|
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | なし |
| Next.js Metrics | http://localhost:3000/api/metrics | なし |
| NestJS Metrics | http://localhost:4000/metrics | なし |

## 🔍 主要なPrometheusクエリ

### HTTPリクエスト
```promql
# リクエストレート（5分平均）
rate(http_requests_total[5m])

# エラー率
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# 95パーセンタイルレスポンスタイム
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### AI分析
```promql
# AI分析成功率
sum(rate(kidoku_ai_analysis_requests_total{status="success"}[5m])) / sum(rate(kidoku_ai_analysis_requests_total[5m]))

# プロバイダー別リクエスト数
sum by (ai_provider) (rate(kidoku_ai_analysis_requests_total[5m]))
```

### システムメトリクス
```promql
# CPU使用率
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# メモリ使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

## 📝 メトリクス追加の例

### Next.js
```typescript
// apps/web/src/lib/metrics.ts に追加
const myCustomMetric = new Counter({
  name: 'kidoku_my_feature_total',
  help: 'Description of my metric',
  labelNames: ['status'],
  registers: [register],
})

export const metricsHelpers = {
  // 既存のヘルパー...
  incrementMyFeature: (status: string) => {
    myCustomMetric.inc({ status })
  },
}

// 使用例
import { metricsHelpers } from '@/lib/metrics'
metricsHelpers.incrementMyFeature('success')
```

### NestJS
```typescript
// メトリクスプロバイダーを追加
export const myFeatureCounter = makeCounterProvider({
  name: 'my_feature_total',
  help: 'My feature counter',
  labelNames: ['action'],
})

// モジュールに追加
providers: [
  // 既存のプロバイダー...
  myFeatureCounter,
]

// サービスで使用
constructor(
  @InjectMetric('my_feature_total')
  private readonly myFeatureCounter: Counter<string>,
) {}

doSomething() {
  this.myFeatureCounter.inc({ action: 'create' })
}
```

## 🔧 よく使うコマンド

```bash
# コンテナの再起動
docker-compose restart prometheus grafana

# 設定ファイルの再読み込み（Prometheus）
docker-compose exec prometheus kill -HUP 1

# Grafanaパスワードリセット
docker-compose exec grafana grafana-cli admin reset-admin-password newpassword

# メトリクスの手動確認
curl -s http://localhost:3000/api/metrics | grep kidoku
curl -s http://localhost:4000/metrics | grep http_

# Prometheusのクエリ実行
curl -s 'http://localhost:9090/api/v1/query?query=up'
```

## 🐛 トラブルシューティング

### メトリクスが表示されない
1. ターゲットの状態確認: http://localhost:9090/targets
2. メトリクスエンドポイントの確認: `curl http://localhost:3000/api/metrics`
3. Prometheusログ確認: `docker-compose logs prometheus`

### Grafanaダッシュボードが空
1. データソース接続確認: Settings > Data Sources
2. 時間範囲の確認（右上のタイムピッカー）
3. クエリの確認: ダッシュボード編集モード

### 高いメモリ使用
1. メトリクスのカーディナリティ確認
2. 不要なラベルの削除
3. スクレイプ間隔の調整

## 📈 パフォーマンスチューニング

### Prometheus
```yaml
# prometheus.yml
global:
  scrape_interval: 30s      # デフォルト15s → 30sに変更
  scrape_timeout: 10s       # タイムアウト設定
  evaluation_interval: 30s  # アラート評価間隔
```

### メトリクスの最適化
```typescript
// ❌ 悪い例：高カーディナリティ
httpRequestsTotal.inc({ 
  user_id: userId,  // ユニークな値が多い
  timestamp: Date.now()  // 常に異なる値
})

// ✅ 良い例：低カーディナリティ
httpRequestsTotal.inc({ 
  method: 'GET',
  status: 'success'
})
```

## 🔗 便利なリンク

- [Grafanaダッシュボード](http://localhost:3001/d/kidoku-main/kidoku-application-dashboard)
- [Prometheusターゲット](http://localhost:9090/targets)
- [Prometheusアラート](http://localhost:9090/alerts)
- [メトリクス一覧](http://localhost:9090/graph)

## 💡 Tips

1. **ダッシュボードのバックアップ**
   ```bash
   # エクスポート
   curl -s http://admin:admin@localhost:3001/api/dashboards/uid/kidoku-main | jq > dashboard-backup.json
   ```

2. **カスタムアラートのテスト**
   ```promql
   # Prometheusコンソールでクエリをテスト
   vector(1) > 0  # 常にtrueになるテストクエリ
   ```

3. **メトリクスのデバッグ**
   ```bash
   # 特定のメトリクスを検索
   curl -s http://localhost:3000/api/metrics | grep -E "^kidoku_"
   ```