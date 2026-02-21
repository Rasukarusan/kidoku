# レガシーAPI調査レポート

GraphQLに移行できていないAPI・CRUD操作の調査結果。

> **更新日:** 2026-02-21
> **対象ブランチ:** master（PR #161 マージ後 — ORM統一完了）

---

## 概要

NestJS GraphQL API（バックエンド）とNext.js API Routes（フロントエンド）が混在している。PR #161でバックエンドのORMがDrizzleからPrismaに統一され、フロントエンド・バックエンドともにPrismaを使用する構成になった。

残る課題は、フロントエンド側のAPI Routeが GraphQLを経由せず直接PrismaでDB操作しているレガシーエンドポイントの移行。

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
| Search | 完全移行済み（Google Books含む） | - |
| SoftwareDesign | 完全移行済み | - |

---

## 1. アーキテクチャ変更: ORM統一

PR #161（commit `3acefac`）でバックエンドのDrizzle ORMがPrismaに置き換えられた。

### 変更内容
- **PrismaService追加**: `apps/api/src/infrastructure/database/prisma.service.ts` — `PrismaClient`を継承したNestJSサービス
- **バックエンドPrismaスキーマ**: `apps/api/prisma/schema.prisma` — 全モデル（User, sheets, books, YearlyTopBook, AiSummaries, template_books等）を定義
- **リポジトリ書き換え**: `BookRepository`, `CommentRepository`, `SheetRepository`がDrizzle→Prismaに移行
- **Drizzle関連ファイル削除**: `drizzle.config.ts`, `database.providers.ts`, `schema/*.schema.ts`すべて削除

### Prismaスキーマの二重管理（注意）

Vercel CIの互換性のため、Prismaスキーマが2箇所に同一内容で存在する:
- `apps/web/prisma/schema.prisma`（フロントエンド）
- `apps/api/prisma/schema.prisma`（バックエンド）

**スキーマ変更時は両方を更新する必要がある。**

### 移行への影響

バックエンドPrismaスキーマに全モデルが定義済みのため、未移行ドメインのGraphQL化に必要な作業は:
- ドメインモデル（`domain/models/`）
- リポジトリインターフェース（`domain/repositories/`）
- リポジトリ実装（`infrastructure/repositories/`）
- ユースケース（`application/usecases/`）
- リゾルバー + DTO（`presentation/resolvers/`, `presentation/dto/`）
- NestJSモジュール（`presentation/modules/`）

のみ。スキーマ追加作業は不要。

---

## 2. GraphQL移行済みの操作

### 現在のGraphQLスキーマ（`apps/api/src/schema.gql`）

**Query (11):**
`sheets`, `comments`, `book`, `books`, `bookCategories`, `searchBooks`, `searchGoogleBooks`, `latestSoftwareDesign`, `softwareDesignByMonth`, `softwareDesignByYear`, `searchSoftwareDesignByISBN`

**Mutation (8):**
`createSheet`, `updateSheet`, `deleteSheet`, `updateSheetOrders`, `createBook`, `updateBook`, `deleteBook`, `indexAllBooks`

### Books（部分移行）
- `updateBook` mutation — PUT `/api/books` からGraphQL経由（`apps/web/src/pages/api/books/index.ts:101`）
- `deleteBook` mutation — DELETE `/api/books` からGraphQL経由（`apps/web/src/pages/api/books/index.ts:140`）
- `createBook` mutation — **スキーマに存在するが、フロントエンドAPI RouteのPOSTでは未使用**
- `book` / `books` / `bookCategories` query — Apollo Clientから使用

### Sheets（完全移行）
- `sheets` query + `createSheet` / `updateSheet` / `deleteSheet` / `updateSheetOrders` mutation

### Search（完全移行）
- `searchBooks` query — `/api/search/shelf.ts` からGraphQL経由
- `searchGoogleBooks` query — `/api/search/google-books.ts` からGraphQL経由（`GoogleBookHitResponse`型、`SearchGoogleBooksInput`入力型あり）
- `indexAllBooks` mutation — Admin API Key Guard付き

### Comments（Read移行済み）
- `comments` query — 公開コメント取得はGraphQL経由

### SoftwareDesign（完全移行）
- `latestSoftwareDesign` / `softwareDesignByMonth` / `softwareDesignByYear` / `searchSoftwareDesignByISBN` query

---

## 3. 未移行のAPI（フロントエンドPrisma直接アクセス）

### 3-1. Books CREATE（POST）
**ファイル:** `apps/web/src/pages/api/books/index.ts:53`

```
prisma.books.create({ data })
prisma.books.update({ where: { id: book.id }, data: { image: url } })
```

- `createBook` mutationがバックエンドに**既に存在する**のに、API RouteのPOSTではPrisma直接で作成
- 画像のVercel Blobアップロード処理がAPI Route側にあるため移行が複雑
- **移行方針:** 画像アップロードはAPI Routeに残し、DB操作のみ`createBook` mutationに委譲。アップロード後にGraphQL `updateBook`で画像URLを更新
- **移行の難易度:** 低（バックエンド側の追加実装不要、フロントエンド側リファクタのみ）

### 3-2. Books一覧取得（シート名別）
**ファイル:** `apps/web/src/pages/api/books/[sheet].ts:13`

```
prisma.books.findMany({ where: { userId, sheet: { name: req.query.sheet } } })
```

- GraphQLの`books` queryは`sheetId`（ID）でフィルタするが、このAPIはシート名（name）でフィルタ
- **移行の難易度:** 低（`GetBooksInput`に`sheetName`フィルタを追加、リポジトリに`findByUserIdAndSheetName`を追加）

### 3-3. User操作（全操作）
**ファイル:**
- `apps/web/src/pages/api/me.ts:14` — ユーザー名更新 `prisma.user.update()`
- `apps/web/src/pages/api/user/index.ts:13` — ユーザー削除 `prisma.user.delete()`
- `apps/web/src/pages/api/user/image.ts:6` — ユーザー画像取得 `prisma.user.findUnique()`
- `apps/web/src/pages/api/check/name.ts:16` — ユーザー名重複チェック `prisma.user.findFirst()`

GraphQLスキーマにUser関連のQuery/Mutationが一切存在しない。

- **移行の難易度:** 低〜中
- **必要なGraphQL操作:**
  - `Query: userImage(name: String!): String` — ユーザー画像取得
  - `Query: isNameAvailable(name: String!): Boolean` — ユーザー名重複チェック
  - `Mutation: updateUserName(name: String!): UserResponse` — ユーザー名更新
  - `Mutation: deleteUser: Boolean` — ユーザー削除
- **必要なDDDレイヤー:** Userドメインモデル、リポジトリI/F＋実装、ユースケース4つ、リゾルバー、DTO

### 3-4. YearlyTopBook（全操作）
**ファイル:** `apps/web/src/pages/api/yearly.ts`

```
prisma.yearlyTopBook.findMany()   # GET
prisma.yearlyTopBook.upsert()     # POST
prisma.yearlyTopBook.delete()     # DELETE
```

GraphQLスキーマにYearlyTopBook関連の操作が一切存在しない。

- **移行の難易度:** 低
- **必要なGraphQL操作:**
  - `Query: yearlyTopBooks(year: String!): [YearlyTopBookResponse!]!`
  - `Mutation: upsertYearlyTopBook(year: String!, order: Int!, bookId: Int!): Boolean`
  - `Mutation: deleteYearlyTopBook(year: String!, order: Int!): Boolean`
- **必要なDDDレイヤー:** ドメインモデル、リポジトリI/F＋実装、ユースケース3つ、リゾルバー、DTO

### 3-5. AiSummaries（全操作）
**ファイル:**
- `apps/web/src/pages/api/ai-summary/_create.ts:80` — AI分析作成 `prisma.aiSummaries.create()`
- `apps/web/src/pages/api/ai-summary/_delete.ts:30` — AI分析削除 `prisma.aiSummaries.deleteMany()`
- `apps/web/src/pages/api/ai-summary/usage.ts:15` — 使用量取得 `prisma.aiSummaries.findMany()`
- `apps/web/src/pages/api/ai-summary/save.ts:49` — 手動保存 `prisma.aiSummaries.create()`

GraphQLスキーマにAiSummaries関連の操作が一切存在しない。

- **移行の難易度:** 高（ストリーミング含む）/ 中（ストリーミング以外）
- **理由:**
  - `_create.ts`はEdge Runtimeで動作し、Cohere AIのストリーミングレスポンスを返す
  - Edge Runtime特有のセッション認証（cookieから直接session tokenを取得）
  - ストリーミング処理はGraphQLの通常のリクエスト/レスポンスモデルと相性が悪い
- **必要なGraphQL操作（ストリーミング以外）:**
  - `Query: aiSummaryUsage: Int!` — 月次使用量
  - `Mutation: saveAiSummary(sheetName: String!, analysis: JSON!): Boolean`
  - `Mutation: deleteAiSummary(id: Int!): Boolean`
- **`_create.ts`のストリーミング処理はREST/Edge APIに残すのが現実的**

### 3-6. Template Books（全操作）
**ファイル:** `apps/web/src/pages/api/template/books.ts`

```
prisma.template_books.findMany()   # GET
prisma.template_books.create()     # POST
prisma.template_books.update()     # POST（画像URL更新）
prisma.template_books.delete()     # DELETE
```

GraphQLスキーマにTemplate Books関連の操作が一切存在しない。

- **移行の難易度:** 中（画像アップロード処理の分離が必要、Books CREATEと同じパターン）
- **必要なGraphQL操作:**
  - `Query: templateBooks: [TemplateBookResponse!]!`
  - `Mutation: createTemplateBook(input: CreateTemplateBookInput!): TemplateBookResponse`
  - `Mutation: deleteTemplateBook(id: Int!): Boolean`

### 3-7. CSV Export
**ファイル:** `apps/web/src/pages/api/export/csv.ts:23`

```
prisma.sheets.findMany({ where: { userId }, include: { books: {...} } })
```

- **移行の難易度:** 低（ただしCSVファイルダウンロードはGraphQLの用途外）
- GraphQLでデータ取得だけ移行し、CSV生成・ダウンロードはAPI Routeに残すのが現実的

---

## 4. SSR/ISRページの直接Prismaアクセス

ISR/SSGのためにサーバーサイドで直接DBアクセスしているページ。パフォーマンス要件上、直接アクセスが妥当だが、該当ドメインのGraphQL queryが整備されれば移行も可能。

| ページ | Prisma操作 | 用途 |
|---|---|---|
| `pages/index.tsx` | `prisma.books.findMany()` | トップページの公開メモ一覧（ISR 5s） |
| `pages/books/[bookId].tsx` | `prisma.books.findFirst()` | 本の詳細（ISR 60s） |
| `pages/[user]/sheets/index.tsx` | `prisma.sheets.findMany()` | ユーザーのシート一覧（SSR→リダイレクト） |
| `pages/[user]/sheets/[year].tsx` | `prisma.user.findUnique()`, `prisma.sheets.findMany()`, `prisma.books.findMany()`, `prisma.yearlyTopBook.findMany()`, `prisma.aiSummaries.findMany()` | 個別シートページ（ISR 5s） |
| `pages/[user]/sheets/total.tsx` | `prisma.user.findUnique()`, `prisma.books.findMany()`, `prisma.$queryRaw`, `prisma.sheets.findMany()`, `prisma.yearlyTopBook.findMany()` | 統計ページ（ISR 5s） |

---

## 5. GraphQL移行対象外のAPIルート

以下はDB CRUD操作ではないか、外部サービス連携のためREST APIに残すのが適切。

| ルート | 用途 | 備考 |
|---|---|---|
| `api/auth/[...nextauth].ts` | NextAuth認証 | フレームワーク要件 |
| `api/auth/init.ts` | セッション確認 | 単純なセッション検証 |
| `api/graphql.ts` | GraphQLプロキシ | プロキシ層そのもの |
| `api/stripe/create-payment-intent.ts` | Stripe決済 | 外部サービス連携 |
| `api/stripe/webhook.ts` | Stripe Webhook | 外部サービスコールバック |
| `api/admin/batch/software-design.ts` | 管理バッチ→NestJS REST | 既にNestJSバックエンドを呼び出し |
| `api/batch/vercel_blob.ts` | 管理用Blob操作 | インフラ管理ツール |
| `api/search/google-books.ts` | Google Books検索 | **移行済み** — GraphQL経由 |
| `api/search/shelf.ts` | 本の検索 | **移行済み** — GraphQL経由 |

---

## 6. 移行優先度の提案

ORM統一により、バックエンドPrismaスキーマに全モデルが定義済み。各ドメインの移行に必要な作業はDDDレイヤーの実装のみで、スキーマ追加は不要。

### 高優先度（低工数・高効果）
1. **YearlyTopBook** — 最も単純なCRUD。外部サービス依存なし。SSR/ISRページからも参照されており、GraphQL化の効果が大きい
2. **User操作** — アプリの基盤ドメイン。4エンドポイントすべて単純なDB操作
3. **Books CREATE** — `createBook` mutationが既にバックエンドに存在。フロントエンド側のリファクタのみで移行可能（画像アップロードはAPI Routeに残し、DB操作をGraphQL経由に変更）

### 中優先度
4. **Books一覧（シート名ベース）** — `GetBooksInput`に`sheetName`フィールド追加のみの最小変更
5. **AiSummaries（非ストリーミング）** — usage取得、save、deleteの3操作は移行可能
6. **Template Books** — 画像アップロード分離が必要だがCRUD自体は単純

### 低優先度（現状維持が妥当）
7. **CSV Export** — ファイルダウンロードはREST APIの方が適切
8. **AiSummaries CREATE（ストリーミング）** — Edge Runtime + SSEはGraphQL移行困難
9. **SSR/ISRの直接Prismaアクセス** — パフォーマンス要件上、直接アクセスが妥当。各ドメインのGraphQL query整備後に段階的に検討

---

## 7. 前回レポートからの変更点

1. **ORM統一完了**: バックエンドがDrizzle→Prismaに移行（PR #161）。旧「Drizzleスキーマ同期状況」セクションは削除
2. **searchGoogleBooks追加**: `GoogleBookHitResponse`型と`SearchGoogleBooksInput`入力型が追加され、Searchドメインは完全移行済みに
3. **移行工数の低下**: バックエンドPrismaスキーマに全モデル定義済みのため、各ドメインの移行はDDDレイヤー実装のみ
4. **Prismaスキーマ二重管理**: `apps/web/prisma/schema.prisma`と`apps/api/prisma/schema.prisma`の両方更新が必要（新しい制約）
5. **SSR/ISRテーブル更新**: `[year].tsx`ページを追加（5つのPrismaクエリを使用する最も複雑なページ）
6. **優先度再評価**: Books CREATEの難易度を「中→低」に変更（バックエンド側の追加実装不要のため）。YearlyTopBookを最高優先度に
