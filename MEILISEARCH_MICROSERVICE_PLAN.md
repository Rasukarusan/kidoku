# MeiliSearch マイクロサービス化プラン

## 現状分析

### 現在のアーキテクチャ
```
┌─────────────┐
│  Next.js    │
│  (web)      │──┐
│             │  │ 直接接続
└─────────────┘  │
                 ↓
              ┌─────────────┐
              │ MeiliSearch │
              │ (Docker)    │
              └─────────────┘
```

**問題点:**
1. **フロントエンドとの密結合**: Next.jsが直接MeiliSearchに接続
2. **認証・認可の欠如**: MeiliSearchへの直接アクセス（マスターキー使用）
3. **削除時の同期漏れ**: 本削除時にインデックス更新がない
4. **スケーラビリティの制約**: フロントエンドとMeiliSearchが同じライフサイクル
5. **バックエンド(NestJS)の未活用**: APIサーバーが検索機能に関与していない
6. **データ整合性**: バッチ更新に依存、リアルタイム同期が不完全

### 現在の使用箇所
- **検索機能**: `/api/search/shelf` (ユーザー本棚検索)
- **インデックス更新**: `/api/books` (作成・更新時)
- **バッチ更新**: `/api/batch/meilisearch` (管理者向け)

---

## マイクロサービス化の目標

### ビジネス目標
1. 検索機能の独立性とスケーラビリティの向上
2. データ整合性の保証（CRUD操作との完全同期）
3. 将来的な検索機能の拡張性（複数インデックス、レコメンデーションなど）

### 技術目標
1. 関心の分離（検索ロジックの分離）
2. イベント駆動アーキテクチャの導入
3. セキュリティの向上（MeiliSearchへの直接アクセス禁止）
4. 独立したデプロイとスケーリング

---

## 推奨アーキテクチャ: イベント駆動型検索マイクロサービス

### アーキテクチャ図
```
┌──────────────┐
│  Next.js     │
│  (Frontend)  │
└──────┬───────┘
       │ GraphQL
       ↓
┌──────────────┐      ┌─────────────────┐
│  NestJS API  │──────│ Message Queue   │
│  (Backend)   │      │ (Redis/RabbitMQ)│
└──────┬───────┘      └────────┬────────┘
       │                       │ Events
       │                       ↓
       │              ┌──────────────────┐
       │              │ Search Service   │
       │              │ (NestJS)         │
       │              │                  │
       │              │ ┌──────────────┐ │
       └──────────────┼─│ MeiliSearch  │ │
         GraphQL      │ └──────────────┘ │
         Query        └──────────────────┘
```

### コンポーネント説明

#### 1. Search Service (新規マイクロサービス)
- **技術スタック**: NestJS + TypeScript
- **責務**:
  - MeiliSearchの管理（インデックス作成、更新、削除）
  - 検索APIの提供（GraphQL/REST）
  - イベントリスナー（本のCRUD操作を購読）
- **エンドポイント**:
  - `POST /search/books` - 本の検索
  - `POST /search/sync` - 手動同期（管理者用）
  - `GET /search/health` - ヘルスチェック

#### 2. Message Queue
- **推奨技術**: Redis Streams または RabbitMQ
- **イベント種類**:
  - `book.created` - 本の作成
  - `book.updated` - 本の更新
  - `book.deleted` - 本の削除
  - `book.memo_visibility_changed` - メモ公開状態変更

#### 3. 既存システムの変更
- **NestJS API**:
  - 本のCRUD操作時にイベント発行
  - 検索リクエストをSearch Serviceにプロキシ
- **Next.js**:
  - MeiliSearchへの直接接続を削除
  - GraphQL経由でSearch Serviceにアクセス

---

## 実装フェーズ

### Phase 1: Search Service 基盤構築 (2-3週間)

#### 1.1 プロジェクトセットアップ
```bash
/apps/search-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── search/
│   │   │   ├── search.module.ts
│   │   │   ├── search.service.ts
│   │   │   ├── search.resolver.ts (GraphQL)
│   │   │   └── dto/
│   │   ├── indexing/
│   │   │   ├── indexing.module.ts
│   │   │   ├── indexing.service.ts
│   │   │   └── book-index.service.ts
│   │   └── events/
│   │       ├── events.module.ts
│   │       └── book-event.listener.ts
│   ├── config/
│   │   └── meilisearch.config.ts
│   └── common/
│       ├── interfaces/
│       └── constants/
├── test/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

#### 1.2 MeiliSearchクライアント実装
```typescript
// src/config/meilisearch.config.ts
import { MeiliSearch } from 'meilisearch'

export const createMeiliSearchClient = () => {
  return new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_MASTER_KEY,
  })
}

// src/modules/indexing/book-index.service.ts
@Injectable()
export class BookIndexService {
  private readonly index: Index

  constructor() {
    const client = createMeiliSearchClient()
    this.index = client.index('books')
  }

  async addOrUpdateBook(book: BookDocument): Promise<void> {
    await this.index.addDocuments([book])
  }

  async deleteBook(bookId: number): Promise<void> {
    await this.index.deleteDocument(bookId)
  }

  async syncAllBooks(books: BookDocument[]): Promise<void> {
    await this.index.deleteAllDocuments()
    await this.index.addDocuments(books)
  }
}
```

#### 1.3 検索API実装
```typescript
// src/modules/search/search.resolver.ts
@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchBooksResponse)
  async searchBooks(
    @Args('query') query: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  ): Promise<SearchBooksResponse> {
    return this.searchService.searchBooks(query, page)
  }
}

// src/modules/search/search.service.ts
@Injectable()
export class SearchService {
  constructor(private readonly bookIndexService: BookIndexService) {}

  async searchBooks(query: string, page: number): Promise<SearchBooksResponse> {
    const result = await this.bookIndexService.index.search(query, {
      attributesToHighlight: ['title', 'memo'],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: '</span>',
      attributesToCrop: ['title', 'memo'],
      cropLength: 15,
      page,
      hitsPerPage: 20,
    })

    return {
      hits: result.hits,
      hasNext: result.page < result.totalPages,
    }
  }
}
```

---

### Phase 2: イベント駆動アーキテクチャ導入 (2-3週間)

#### 2.1 メッセージキュー選定

**推奨: Redis Streams**
- 理由:
  - 既存のRedis利用可能性（セッション管理で使用中の可能性）
  - 軽量でセットアップが簡単
  - 十分なパフォーマンス
  - コスト効率が良い

**代替案: RabbitMQ**
- より複雑なイベントルーティングが必要な場合
- 将来的な拡張性重視の場合

#### 2.2 イベント発行側 (NestJS API)

```typescript
// apps/api/src/modules/books/events/book-event.publisher.ts
import { Injectable } from '@nestjs/common'
import { RedisService } from '@/common/redis/redis.service'

export enum BookEventType {
  CREATED = 'book.created',
  UPDATED = 'book.updated',
  DELETED = 'book.deleted',
  MEMO_VISIBILITY_CHANGED = 'book.memo_visibility_changed',
}

export interface BookEvent {
  type: BookEventType
  bookId: number
  userId: string
  timestamp: Date
  data?: any
}

@Injectable()
export class BookEventPublisher {
  constructor(private readonly redisService: RedisService) {}

  async publish(event: BookEvent): Promise<void> {
    await this.redisService.xadd(
      'book-events',
      '*',
      'event',
      JSON.stringify(event),
    )
  }

  async publishBookCreated(bookId: number, userId: string): Promise<void> {
    await this.publish({
      type: BookEventType.CREATED,
      bookId,
      userId,
      timestamp: new Date(),
    })
  }

  async publishBookUpdated(bookId: number, userId: string): Promise<void> {
    await this.publish({
      type: BookEventType.UPDATED,
      bookId,
      userId,
      timestamp: new Date(),
    })
  }

  async publishBookDeleted(bookId: number, userId: string): Promise<void> {
    await this.publish({
      type: BookEventType.DELETED,
      bookId,
      userId,
      timestamp: new Date(),
    })
  }
}
```

#### 2.3 BooksResolverへの統合
```typescript
// apps/api/src/modules/books/books.resolver.ts
@Resolver()
export class BooksResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly bookEventPublisher: BookEventPublisher,
  ) {}

  @Mutation(() => Book)
  async createBook(@Args('input') input: CreateBookInput): Promise<Book> {
    const book = await this.booksService.create(input)

    // イベント発行
    await this.bookEventPublisher.publishBookCreated(book.id, book.userId)

    return book
  }

  @Mutation(() => Book)
  async updateBook(@Args('input') input: UpdateBookInput): Promise<Book> {
    const book = await this.booksService.update(input)

    // イベント発行
    await this.bookEventPublisher.publishBookUpdated(book.id, book.userId)

    return book
  }

  @Mutation(() => Boolean)
  async deleteBook(@Args('id') id: number): Promise<boolean> {
    const book = await this.booksService.findOne(id)
    await this.booksService.delete(id)

    // イベント発行
    await this.bookEventPublisher.publishBookDeleted(id, book.userId)

    return true
  }
}
```

#### 2.4 イベント購読側 (Search Service)

```typescript
// apps/search-service/src/modules/events/book-event.listener.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { RedisService } from '@/common/redis/redis.service'
import { BookIndexService } from '../indexing/book-index.service'

@Injectable()
export class BookEventListener implements OnModuleInit {
  private readonly consumerGroup = 'search-service'
  private readonly consumerName = 'search-worker-1'

  constructor(
    private readonly redisService: RedisService,
    private readonly bookIndexService: BookIndexService,
    private readonly bookDataService: BookDataService,
  ) {}

  async onModuleInit() {
    await this.startListening()
  }

  private async startListening() {
    while (true) {
      try {
        const messages = await this.redisService.xreadgroup(
          'GROUP',
          this.consumerGroup,
          this.consumerName,
          'BLOCK',
          5000,
          'STREAMS',
          'book-events',
          '>',
        )

        for (const message of messages) {
          await this.handleEvent(message)
        }
      } catch (error) {
        console.error('Error reading events:', error)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  private async handleEvent(message: any) {
    const event = JSON.parse(message.event)

    switch (event.type) {
      case 'book.created':
      case 'book.updated':
        const book = await this.bookDataService.fetchBook(event.bookId)
        if (book && book.sheet) {
          await this.bookIndexService.addOrUpdateBook(book)
        }
        break

      case 'book.deleted':
        await this.bookIndexService.deleteBook(event.bookId)
        break
    }

    // ACK
    await this.redisService.xack('book-events', this.consumerGroup, message.id)
  }
}
```

#### 2.5 データ取得サービス (Search Service)

Search Serviceは本のデータを直接データベースから取得する必要があります：

```typescript
// apps/search-service/src/modules/indexing/book-data.service.ts
import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class BookDataService {
  private readonly prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async fetchBook(bookId: number): Promise<BookDocument | null> {
    const book = await this.prisma.books.findUnique({
      where: { id: bookId },
      include: {
        sheet: true,
        user: true,
      },
    })

    if (!book || !book.sheet) {
      return null
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      memo: book.is_public_memo ? book.memo : '',
      username: book.user.username,
      userImage: book.user.image,
      sheet: book.sheet.name,
    }
  }

  async fetchAllBooks(): Promise<BookDocument[]> {
    const books = await this.prisma.books.findMany({
      where: {
        sheet: { isNot: null },
      },
      include: {
        sheet: true,
        user: true,
      },
    })

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      memo: book.is_public_memo ? book.memo : '',
      username: book.user.username,
      userImage: book.user.image,
      sheet: book.sheet.name,
    }))
  }
}
```

---

### Phase 3: フロントエンド統合 (1-2週間)

#### 3.1 GraphQLスキーマ追加 (NestJS API)

```graphql
# apps/api/src/schema.gql

type SearchHit {
  id: Int!
  title: String!
  author: String!
  image: String!
  memo: String!
  username: String!
  userImage: String!
  sheet: String!
  _formatted: FormattedFields
}

type FormattedFields {
  title: String
  memo: String
}

type SearchBooksResponse {
  hits: [SearchHit!]!
  hasNext: Boolean!
}

type Query {
  searchBooks(query: String!, page: Int = 1): SearchBooksResponse!
}
```

#### 3.2 API経由でSearch Serviceを呼び出し

```typescript
// apps/api/src/modules/search/search.resolver.ts
import { Injectable } from '@nestjs/common'
import { Query, Args, Int } from '@nestjs/graphql'
import { HttpService } from '@nestjs/axios'

@Resolver()
export class SearchResolver {
  constructor(private readonly httpService: HttpService) {}

  @Query(() => SearchBooksResponse)
  async searchBooks(
    @Args('query') query: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  ): Promise<SearchBooksResponse> {
    const response = await this.httpService.axiosRef.post(
      `${process.env.SEARCH_SERVICE_URL}/search/books`,
      { query, page },
    )
    return response.data
  }
}
```

#### 3.3 フロントエンド変更

```typescript
// apps/web/src/graphql/queries/searchBooks.graphql (新規)
query SearchBooks($query: String!, $page: Int) {
  searchBooks(query: $query, page: $page) {
    hits {
      id
      title
      author
      image
      memo
      username
      userImage
      sheet
      _formatted {
        title
        memo
      }
    }
    hasNext
  }
}
```

```typescript
// apps/web/src/hooks/useSearchBooks.ts (新規)
import { useSearchBooksQuery } from '@/graphql/generated'

export const useSearchBooks = (query: string, page: number) => {
  const { data, loading, error } = useSearchBooksQuery({
    variables: { query, page },
    skip: !query,
  })

  return {
    books: data?.searchBooks.hits ?? [],
    hasNext: data?.searchBooks.hasNext ?? false,
    loading,
    error,
  }
}
```

```typescript
// apps/web/src/components/input/SearchBox/UserBooks.tsx (変更)
const UserBooks: React.FC<Props> = ({ input, onClose }) => {
  const [page, setPage] = useState(1)
  const { books, hasNext, loading } = useSearchBooks(input, page)

  return (
    <div>
      {loading && <Spinner />}
      {books.map((book) => (
        <BookItem key={book.id} book={book} />
      ))}
      {hasNext && <Button onClick={() => setPage(page + 1)}>次へ</Button>}
    </div>
  )
}
```

#### 3.4 既存APIエンドポイントの削除

以下のファイルを削除:
- `/apps/web/src/pages/api/search/shelf.ts`
- `/apps/web/src/pages/api/batch/meilisearch.ts`
- `/apps/web/src/libs/meilisearch/` (全体)

環境変数から削除:
- `MEILI_HOST`
- `MEILI_MASTER_KEY`

---

### Phase 4: インフラストラクチャとデプロイ (1-2週間)

#### 4.1 Docker構成

```yaml
# docker-compose.yml (更新)
version: '3.8'

services:
  # 既存サービス
  mysql:
    # ... 既存設定

  meilisearch:
    build:
      context: ./docker/meilisearch
      dockerfile: Dockerfile
    ports:
      - '7700:7700'
    volumes:
      - ./docker/meilisearch/data/meilisearch:/meili_data/data.ms
    environment:
      - MEILI_HTTP_ADDR=0.0.0.0:7700
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
    networks:
      - kidoku-network

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    networks:
      - kidoku-network

  # 新規サービス
  search-service:
    build:
      context: ./apps/search-service
      dockerfile: Dockerfile
    ports:
      - '3002:3000'
    environment:
      - MEILI_HOST=http://meilisearch:7700
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - meilisearch
      - redis
      - mysql
    networks:
      - kidoku-network

volumes:
  redis-data:

networks:
  kidoku-network:
    driver: bridge
```

#### 4.2 Kubernetes構成 (本番環境)

```yaml
# k8s/search-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: search-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: search-service
  template:
    metadata:
      labels:
        app: search-service
    spec:
      containers:
        - name: search-service
          image: kidoku/search-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: MEILI_HOST
              value: http://meilisearch-service:7700
            - name: MEILI_MASTER_KEY
              valueFrom:
                secretKeyRef:
                  name: meilisearch-secret
                  key: master-key
            - name: REDIS_URL
              value: redis://redis-service:6379
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
          resources:
            requests:
              memory: '256Mi'
              cpu: '200m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: search-service
spec:
  selector:
    app: search-service
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
```

---

### Phase 5: 監視・運用 (継続的)

#### 5.1 ログ・メトリクス

```typescript
// apps/search-service/src/common/logging/logger.ts
import { Injectable, LoggerService } from '@nestjs/common'
import * as winston from 'winston'

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    })
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context })
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context })
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context })
  }
}
```

#### 5.2 メトリクス収集

```typescript
// apps/search-service/src/modules/search/search.service.ts
import { Injectable } from '@nestjs/common'
import { Counter, Histogram } from 'prom-client'

@Injectable()
export class SearchService {
  private readonly searchCounter: Counter
  private readonly searchDuration: Histogram

  constructor() {
    this.searchCounter = new Counter({
      name: 'search_requests_total',
      help: 'Total number of search requests',
      labelNames: ['status'],
    })

    this.searchDuration = new Histogram({
      name: 'search_duration_seconds',
      help: 'Search request duration in seconds',
      buckets: [0.1, 0.5, 1, 2, 5],
    })
  }

  async searchBooks(query: string, page: number) {
    const timer = this.searchDuration.startTimer()

    try {
      const result = await this.performSearch(query, page)
      this.searchCounter.inc({ status: 'success' })
      return result
    } catch (error) {
      this.searchCounter.inc({ status: 'error' })
      throw error
    } finally {
      timer()
    }
  }
}
```

#### 5.3 アラート設定

Prometheus + Grafanaでの監視項目:
- 検索レイテンシ (95パーセンタイル < 500ms)
- エラー率 (< 1%)
- イベント処理遅延 (< 5秒)
- MeiliSearchインデックスサイズ
- Redis接続状態

---

## データ移行計画

### ステップ1: 並行運用期間の設定
1. Search Serviceをデプロイ
2. 既存のNext.js APIと並行稼働
3. トラフィックを徐々にSearch Serviceに移行（Feature Flag使用）

### ステップ2: データ検証
```bash
# 既存システムの検索結果を取得
curl "http://localhost:3000/api/search/shelf?q=test&page=1" > old-results.json

# 新システムの検索結果を取得
curl -X POST http://localhost:3002/search/books \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "page": 1}' > new-results.json

# 差分検証
diff old-results.json new-results.json
```

### ステップ3: カットオーバー
1. Feature Flagを100%に設定
2. 既存のMeiliSearch APIエンドポイントを削除
3. 環境変数クリーンアップ

---

## リスクと対策

### リスク1: イベント配信の失敗
**対策**:
- Redis Streams の Consumer Group でメッセージ永続化
- Dead Letter Queueの実装
- 定期的なバッチ同期バックアップ

### リスク2: Search Serviceのダウンタイム
**対策**:
- 複数レプリカ配置 (最低2台)
- ヘルスチェックとオートヒーリング
- フォールバック: 一時的にデータベース直接検索

### リスク3: データ不整合
**対策**:
- イベント順序保証（Redis Streams）
- 定期的な全量同期ジョブ（毎日深夜）
- 監視とアラート

### リスク4: パフォーマンス劣化
**対策**:
- 検索APIのキャッシング（Redis）
- MeiliSearchインデックス最適化
- 水平スケーリング準備

---

## コスト見積もり

### 開発コスト
- Phase 1-2: 4-6週間（Search Service開発 + イベント駆動化）
- Phase 3: 1-2週間（フロントエンド統合）
- Phase 4: 1-2週間（インフラ構築）
- **合計: 6-10週間**

### 運用コスト
- Search Serviceインスタンス: 2台 x $20/月 = $40/月
- Redis: $10/月
- MeiliSearch: 既存と同じ
- **追加コスト: 約$50/月**

---

## 成功指標

### 技術指標
- [ ] 検索レイテンシ P95 < 500ms
- [ ] イベント処理遅延 < 5秒
- [ ] データ整合性 99.9%以上
- [ ] サービス可用性 99.9%以上

### ビジネス指標
- [ ] 検索機能のダウンタイムゼロでの移行
- [ ] ユーザー体験の劣化なし
- [ ] 削除時の同期問題の解消（現在の課題）

---

## 代替案検討

### 代替案1: バックエンドAPI統合型（シンプル）
```
Next.js → NestJS API → MeiliSearch
```

**メリット**:
- マイクロサービスを作らない（コスト削減）
- 実装が簡単

**デメリット**:
- NestJS APIに検索ロジックが混在
- 独立スケーリング不可
- 関心の分離が不十分

### 代替案2: GraphQL Federation
```
Next.js → GraphQL Gateway
              ├─ API Service
              └─ Search Service (独立GraphQL)
```

**メリット**:
- 真のマイクロサービスアーキテクチャ
- 各サービスが完全独立

**デメリット**:
- 複雑性が高い
- 運用コストが高い
- オーバーエンジニアリングの可能性

---

## 推奨事項

1. **Phase 1-2を優先実装**
   - Search Serviceの基盤構築
   - イベント駆動アーキテクチャ導入
   - これだけで削除時の同期問題が解決

2. **段階的移行**
   - Feature Flagで徐々にトラフィック移行
   - 問題発生時はすぐにロールバック可能

3. **監視体制の整備**
   - デプロイ前にログ・メトリクスを実装
   - アラート設定を完了

4. **ドキュメント整備**
   - API仕様書
   - 運用手順書
   - トラブルシューティングガイド

---

## 次のステップ

このプランを承認いただけましたら、以下の順序で進めます:

1. Search Serviceのプロジェクト構成作成
2. MeiliSearchクライアントと検索API実装
3. イベント発行・購読の実装
4. フロントエンド統合
5. テストとドキュメント作成

**承認が必要な決定事項:**
- [ ] アーキテクチャの選択（推奨: イベント駆動型）
- [ ] メッセージキューの選択（推奨: Redis Streams）
- [ ] デプロイ環境（Docker Compose / Kubernetes）
- [ ] 実装開始タイミング
