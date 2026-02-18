# レガシーAPI調査レポート

GraphQLに移行できていないAPI・CRUD操作の調査結果。

---

## 概要

現在のアーキテクチャでは、NestJS GraphQL API（バックエンド）とNext.js API Routes（フロントエンド）が混在している。GraphQLに移行済みの操作と、フロントエンド側で直接Prismaを使っているレガシーREST APIが共存している状態。

### 移行状況サマリー

| ドメイン | GraphQL移行済み | 未移行（Prisma直接） |
|---|---|---|
| Books | CRUD（部分的） | POST(create)のみPrisma直接 |
| Sheets | 完全移行済み | - |
| User | - | 全操作が未移行 |
| YearlyTopBook | - | 全操作が未移行 |
| AiSummaries | - | 全操作が未移行 |
| Template Books | - | 全操作が未移行 |
| CSV Export | - | 未移行 |
| Comments | Read のみ移行済み | - |
| Search | 移行済み | - |
| SoftwareDesign | 移行済み | - |

---

## 1. GraphQL移行済みの操作

### Books（部分移行）
- `updateBook` mutation - PUT `/api/books` からGraphQL mutation経由で呼び出し済み（`apps/web/src/pages/api/books/index.ts:101`）
- `deleteBook` mutation - DELETE `/api/books` からGraphQL mutation経由で呼び出し済み（`apps/web/src/pages/api/books/index.ts:140`）
- `createBook` mutation - GraphQLスキーマに存在するが、**API Routeでは未使用**（Prisma直接）
- `book` / `books` / `bookCategories` query - フロントエンドのApollo Clientから使用

### Sheets（完全移行）
- `sheets` query
- `createSheet` / `updateSheet` / `deleteSheet` / `updateSheetOrders` mutation
- すべてGraphQL経由で操作

### Search（移行済み）
- `searchBooks` query - `/api/search/shelf.ts` からGraphQL経由
- `searchGoogleBooks` query - `/api/search/google-books.ts` からGraphQL経由
- `indexAllBooks` mutation - Admin API Key Guard付き

### Comments（Read移行済み）
- `comments` query - 公開コメント取得はGraphQL経由

### SoftwareDesign（移行済み）
- `latestSoftwareDesign` / `softwareDesignByMonth` / `softwareDesignByYear` / `searchSoftwareDesignByISBN` query

---

## 2. 未移行のAPI（フロントエンドPrisma直接アクセス）

### 2-1. Books CREATE（POST）
**ファイル:** `apps/web/src/pages/api/books/index.ts:53`

```
prisma.books.create({ data })
prisma.books.update({ where: { id: book.id }, data: { image: url } })
```

- GraphQLの`createBook` mutationがバックエンドに存在するのに、API RouteではPrisma直接で作成している
- 画像のVercel Blobアップロード処理がAPI Route側にあるため、GraphQL移行が複雑
- **移行の難易度:** 中（画像アップロード処理の分離が必要）

### 2-2. Books一覧取得（シート別）
**ファイル:** `apps/web/src/pages/api/books/[sheet].ts:13`

```
prisma.books.findMany({ where: { userId, sheet: { name: req.query.sheet } } })
```

- シート名ベースでの本一覧取得
- GraphQLの`books` queryは`sheetId`（ID）でフィルタするが、このAPIはシート名（name）でフィルタ
- **移行の難易度:** 低（GraphQL queryにsheetNameフィルタを追加するだけ）

### 2-3. User操作（全操作）
**ファイル:**
- `apps/web/src/pages/api/me.ts:14` - ユーザー名更新 `prisma.user.update()`
- `apps/web/src/pages/api/user/index.ts:13` - ユーザー削除 `prisma.user.delete()`
- `apps/web/src/pages/api/user/image.ts:6` - ユーザー画像取得 `prisma.user.findUnique()`
- `apps/web/src/pages/api/check/name.ts:16` - ユーザー名重複チェック `prisma.user.findFirst()`

GraphQLスキーマにUser関連のQuery/Mutationが一切存在しない。

- **移行の難易度:** 低〜中
- **必要なGraphQL操作:**
  - `Query: user(name: String!): UserResponse` - ユーザー情報取得
  - `Query: userImage(name: String!): String` - ユーザー画像取得
  - `Query: isNameAvailable(name: String!): Boolean` - ユーザー名重複チェック
  - `Mutation: updateUserName(name: String!): UserResponse` - ユーザー名更新
  - `Mutation: deleteUser: Boolean` - ユーザー削除

### 2-4. YearlyTopBook（全操作）
**ファイル:** `apps/web/src/pages/api/yearly.ts`

```
prisma.yearlyTopBook.findMany()   # GET  (14行目)
prisma.yearlyTopBook.upsert()     # POST (28行目)
prisma.yearlyTopBook.delete()     # DELETE (47行目)
```

GraphQLスキーマにYearlyTopBook関連の操作が一切存在しない。

- **移行の難易度:** 低
- **必要なGraphQL操作:**
  - `Query: yearlyTopBooks(year: String!): [YearlyTopBookResponse!]!`
  - `Mutation: upsertYearlyTopBook(year: String!, order: Int!, bookId: Int!): Boolean`
  - `Mutation: deleteYearlyTopBook(year: String!, order: Int!): Boolean`

### 2-5. AiSummaries（全操作）
**ファイル:**
- `apps/web/src/pages/api/ai-summary/_create.ts:80` - AI分析作成 `prisma.aiSummaries.create()`
- `apps/web/src/pages/api/ai-summary/_delete.ts:30` - AI分析削除 `prisma.aiSummaries.deleteMany()`
- `apps/web/src/pages/api/ai-summary/usage.ts:15` - 使用量取得 `prisma.aiSummaries.findMany()`
- `apps/web/src/pages/api/ai-summary/save.ts:49` - 手動保存 `prisma.aiSummaries.create()`

GraphQLスキーマにAiSummaries関連の操作が一切存在しない。

- **移行の難易度:** 高
- **理由:**
  - `_create.ts`はEdge Runtimeで動作し、Cohere AIのストリーミングレスポンスを返す
  - Edge Runtime特有のセッション認証（cookieから直接session tokenを取得）
  - ストリーミング処理はGraphQLの通常のリクエスト/レスポンスモデルと相性が悪い
- **必要なGraphQL操作（ストリーミング以外）:**
  - `Query: aiSummaryUsage: Int!` - 月次使用量
  - `Mutation: saveAiSummary(sheetName: String!, analysis: JSON!): Boolean`
  - `Mutation: deleteAiSummary(id: Int!): Boolean`
- **`_create.ts`のストリーミング処理はGraphQL Subscriptionまたは別アプローチが必要**

### 2-6. Template Books（全操作）
**ファイル:** `apps/web/src/pages/api/template/books.ts`

```
prisma.template_books.findMany()   # GET  (28行目)
prisma.template_books.create()     # POST (56行目)
prisma.template_books.update()     # POST (65行目, 画像URL更新)
prisma.template_books.delete()     # DELETE (78行目)
```

GraphQLスキーマにTemplate Books関連の操作が一切存在しない。

- **移行の難易度:** 中（画像アップロード処理の分離が必要）
- **必要なGraphQL操作:**
  - `Query: templateBooks: [TemplateBookResponse!]!`
  - `Mutation: createTemplateBook(input: CreateTemplateBookInput!): TemplateBookResponse`
  - `Mutation: deleteTemplateBook(id: Int!): Boolean`

### 2-7. CSV Export
**ファイル:** `apps/web/src/pages/api/export/csv.ts:23`

```
prisma.sheets.findMany({ where: { userId }, include: { books: {...} } })
```

- **移行の難易度:** 低（ただしCSVファイルダウンロードはGraphQLの用途外）
- GraphQLでデータ取得だけ移行し、CSV生成・ダウンロードはAPI Routeに残すのが現実的

---

## 3. SSR/SSGでの直接Prismaアクセス

以下のページではgetStaticProps/getServerSidePropsで直接Prismaを使用している。これらはISR/SSGのためにサーバーサイドで直接DBアクセスが必要なケースで、GraphQL移行の対象外とすることも妥当。

| ページ | Prisma操作 | 用途 |
|---|---|---|
| `pages/index.tsx` | `prisma.books.findMany()` | トップページの公開メモ一覧（ISR） |
| `pages/books/[bookId].tsx` | `prisma.books.findFirst()` | 本の詳細（ISR） |
| `pages/[user]/sheets/index.tsx` | `prisma.sheets.findMany()` | ユーザーのシート一覧（SSR） |
| `pages/[user]/sheets/total.tsx` | `prisma.user.findUnique()`, `prisma.books.findMany()`, `prisma.$queryRaw`, `prisma.sheets.findMany()`, `prisma.yearlyTopBook.findMany()` | 統計ページ（ISR） |

---

## 4. 移行優先度の提案

### 高優先度（GraphQLスキーマに対応するものがなく、影響範囲が大きい）
1. **User操作** - ユーザー管理はアプリの基盤。GraphQLでUser型を定義してCRUDを移行
2. **YearlyTopBook** - 単純なCRUDで移行コストが低い
3. **Books CREATE** - updateとdeleteは移行済みなのにcreateだけPrisma直接という不整合

### 中優先度
4. **Template Books** - 画像アップロードの分離が必要だがCRUDは単純
5. **AiSummaries（ストリーミング以外）** - usage取得、save、deleteは移行可能
6. **Books一覧取得（シート名ベース）** - GraphQL queryにフィルタ条件追加で対応可能

### 低優先度（現状維持でも問題が少ない）
7. **CSV Export** - ファイルダウンロードはREST APIの方が適切
8. **AiSummaries CREATE（ストリーミング）** - Edge Runtime + SSEはGraphQL移行困難
9. **SSR/SSGの直接Prismaアクセス** - ISR/SSGのパフォーマンス要件上、直接アクセスが妥当

---

## 5. バックエンドのDrizzleスキーマとの同期状況

以下のDrizzleスキーマはすべて存在しており、テーブル定義の同期は完了済み：
- `apps/api/src/infrastructure/database/schema/yearly-top-books.schema.ts`
- `apps/api/src/infrastructure/database/schema/ai-summaries.schema.ts`
- `apps/api/src/infrastructure/database/schema/template-books.schema.ts`

Drizzleスキーマは準備できているので、GraphQL移行に必要なのはドメインモデル・リポジトリ・ユースケース・リゾルバーの実装のみ。
