# レガシーAPI調査レポート

GraphQLに移行できていないAPI・CRUD操作の調査結果。

> **更新日:** 2026-02-21
> **対象ブランチ:** `claude/investigate-legacy-apis-u5NXX`（GraphQL移行作業ブランチ）

---

## 概要

NestJS GraphQL API（バックエンド）とNext.js API Routes（フロントエンド）が混在していたアーキテクチャに対し、以下の段階的移行を実施済み:

1. **ORM統一**: バックエンドDrizzle→Prisma移行（PR #161）
2. **バックエンドGraphQL API拡充**: User, YearlyTopBook, AiSummaries, TemplateBooks, Books（sheetNameフィルタ）の各ドメインにリゾルバー・ユースケース・リポジトリを追加
3. **フロントエンドAPI Route移行**: Prisma直接アクセス → `graphqlClient.execute()` 経由に変更
4. **Apollo Client直接呼び出し化**: API Route経由の中間層を廃止し、フロントエンドコンポーネントからApollo Client（`useQuery`/`useMutation`/`useLazyQuery`）で直接GraphQLを呼び出すように変更

### 移行状況サマリー

| ドメイン | GraphQL API | フロントエンド | 残存API Route |
|---|---|---|---|
| Books | CRUD完全移行済み | PUT/DELETE: graphqlClient経由API Route | POST: Prisma直接（画像アップロード） |
| Books一覧（sheet別） | `sheetName`フィルタ追加済み | graphqlClient経由API Route | `[sheet].ts`（snake_case変換のため残存） |
| Sheets | 完全移行済み | Apollo Client直接 | なし |
| User | 完全移行済み | Apollo Client直接 | なし |
| YearlyTopBook | 完全移行済み | Apollo Client直接 | なし |
| AiSummaries | 非ストリーミング完全移行 | Apollo Client直接 | `_create.ts`（Edge Runtime/ストリーミング） |
| Template Books | GET/DELETE移行済み | Apollo Client直接 | POST: Prisma直接（画像アップロード） |
| CSV Export | 未移行 | - | Prisma直接 |
| Comments | Read移行済み | - | - |
| Search | 完全移行済み（Google Books含む） | - | - |
| SoftwareDesign | 完全移行済み | - | - |

---

## 1. アーキテクチャ変更履歴

### ORM統一（PR #161）
- バックエンドDrizzle→Prisma移行
- `PrismaService`追加、全リポジトリ書き換え
- Prismaスキーマは`apps/web/prisma/schema.prisma`と`apps/api/prisma/schema.prisma`の2箇所に同一内容

### バックエンドGraphQL API拡充（本ブランチ）
以下のドメインにDDDレイヤー一式（ドメインモデル、リポジトリI/F＋実装、ユースケース、リゾルバー、DTO）を追加:
- **User**: `userImage`, `isNameAvailable` query / `updateUserName`, `deleteUser` mutation
- **YearlyTopBook**: `yearlyTopBooks` query / `upsertYearlyTopBook`, `deleteYearlyTopBook` mutation
- **AiSummaries**: `aiSummaryUsage` query / `saveAiSummary`, `deleteAiSummary` mutation
- **TemplateBooks**: `templateBooks` query / `deleteTemplateBook` mutation
- **Books**: `GetBooksInput`に`sheetName`フィルタを追加

### フロントエンドAPI Route→graphqlClient移行（本ブランチ）
Prisma直接アクセスしていたAPI Routeを`graphqlClient.execute()`経由に変更:
- `yearly.ts`, `me.ts`, `user/index.ts`, `user/image.ts`, `check/name.ts`
- `ai-summary/usage.ts`, `ai-summary/save.ts`
- `template/books.ts`（GET/DELETE）
- `books/[sheet].ts`

### API Route→Apollo Client直接呼び出し化（本ブランチ）
API Route中間層を廃止し、コンポーネントからApollo Clientで直接GraphQLを呼び出し:

| 削除したAPI Route | 移行先コンポーネント | Apollo Client Hook |
|---|---|---|
| `yearly.ts` | YearlyTopBooks.tsx | `useQuery(getYearlyTopBooksQuery)` |
| `yearly.ts` | YearlyTopBooksModal.tsx | `useMutation(upsertYearlyTopBookMutation)` / `useMutation(deleteYearlyTopBookMutation)` |
| `me.ts` | ProfilePage.tsx | `useMutation(updateUserNameMutation)` |
| `user/index.ts` | ProfilePage.tsx | `useMutation(deleteUserMutation)` |
| `user/image.ts` | Tabs.tsx | `useQuery(userImageQuery)` |
| `check/name.ts` | ProfilePage.tsx | `useLazyQuery(isNameAvailableQuery)` |
| `ai-summary/usage.ts` | Confirm.tsx | `useQuery(aiSummaryUsageQuery)` |
| `ai-summary/save.ts` | Confirm.tsx | `useMutation(saveAiSummaryMutation)` |
| - | useAiHelpers.ts | `useMutation(deleteAiSummaryMutation)` |
| `template/books.ts` GET/DELETE | Template.tsx | `useQuery(templateBooksQuery)` / `useMutation(deleteTemplateBookMutation)` |

`/api/graphql`プロキシを公開クエリ対応に更新（未認証時は`executePublic()`で転送）。

### GraphQL定義ファイル構成

```
apps/web/src/features/
├── sheet/api/
│   ├── queries.ts    # getSheetsQuery, getYearlyTopBooksQuery, aiSummaryUsageQuery
│   ├── mutations.ts  # createSheet, updateSheet, deleteSheet, updateSheetOrders,
│   │                 # upsertYearlyTopBook, deleteYearlyTopBook,
│   │                 # deleteAiSummary, saveAiSummary
│   └── index.ts
├── books/api/
│   ├── queries.ts    # getBookQuery, getBookCategoriesQuery
│   └── index.ts
├── user/api/
│   ├── queries.ts    # userImageQuery, isNameAvailableQuery
│   ├── mutations.ts  # updateUserNameMutation, deleteUserMutation
│   └── index.ts
└── template/api/
    ├── queries.ts    # templateBooksQuery
    ├── mutations.ts  # deleteTemplateBookMutation
    └── index.ts
```

---

## 2. GraphQL移行済みの操作

### 現在のGraphQLスキーマ

**Query (18):**
`sheets`, `comments`, `book`, `books`, `bookCategories`, `searchBooks`, `searchGoogleBooks`, `latestSoftwareDesign`, `softwareDesignByMonth`, `softwareDesignByYear`, `searchSoftwareDesignByISBN`, `userImage`, `isNameAvailable`, `yearlyTopBooks`, `aiSummaryUsage`, `templateBooks`

**Mutation (16):**
`createSheet`, `updateSheet`, `deleteSheet`, `updateSheetOrders`, `createBook`, `updateBook`, `deleteBook`, `indexAllBooks`, `updateUserName`, `deleteUser`, `upsertYearlyTopBook`, `deleteYearlyTopBook`, `saveAiSummary`, `deleteAiSummary`, `deleteTemplateBook`

> **注:** `schema.gql`はNestJSサーバー起動時に自動再生成。現在のファイルは旧状態だが、リゾルバーコードは全て実装済み。

### フロントエンドでApollo Client直接呼び出しのもの
- Sheets: `useQuery(getSheetsQuery)`, `useMutation(createSheet/updateSheet/deleteSheet/updateSheetOrders)`
- User: `useQuery(userImageQuery)`, `useLazyQuery(isNameAvailableQuery)`, `useMutation(updateUserName/deleteUser)`
- YearlyTopBook: `useQuery(getYearlyTopBooksQuery)`, `useMutation(upsertYearlyTopBook/deleteYearlyTopBook)`
- AiSummaries: `useQuery(aiSummaryUsageQuery)`, `useMutation(saveAiSummary/deleteAiSummary)`
- TemplateBooks: `useQuery(templateBooksQuery)`, `useMutation(deleteTemplateBook)`
- Books: `useQuery(getBookQuery/getBookCategoriesQuery)`

### API Route（graphqlClient）経由のもの
- Books PUT/DELETE: `graphqlClient.execute()` → `updateBook`/`deleteBook` mutation
- Books GET (by sheet): `graphqlClient.execute()` → `books` query（sheetNameフィルタ）

---

## 3. 残存する未移行・部分移行のAPI Route

### 3-1. Books CREATE（POST）
**ファイル:** `apps/web/src/pages/api/books/index.ts`

- Prisma直接で`books.create()` → Vercel Blob画像アップロード → `books.update()`
- `createBook` mutationがバックエンドに存在するが、画像アップロードフローとの密結合で未移行
- **移行の難易度:** 高（画像アップロードフローの設計見直しが必要）

### 3-2. Books一覧取得（シート名別）
**ファイル:** `apps/web/src/pages/api/books/[sheet].ts`

- graphqlClient経由でGraphQL APIを呼び出し済み
- API Routeが残る理由: レスポンスのsnake_case変換（`isPublicMemo`→`is_public_memo`, `sheetId`→`sheet_id`）とcomputed fields（`month`, `sheet`）の付与
- **Apollo Client直接化の障壁:** フロントエンドの`Book`型がsnake_caseフィールドを使用しており、多数のコンポーネントに影響。`Book`型のcamelCase統一が前提

### 3-3. Template Books POST（画像アップロード）
**ファイル:** `apps/web/src/pages/api/template/books.ts`（POSTのみ）

- Prisma直接で`template_books.create()` → Vercel Blob画像アップロード → `template_books.update()`
- Books CREATEと同じ画像アップロードパターン
- **移行の難易度:** 中（Books CREATEと同時に対応するのが効率的）

### 3-4. AI Summary CREATE（ストリーミング）
**ファイル:** `apps/web/src/pages/api/ai-summary/_create.ts`

- Edge Runtimeで動作、Cohere AIのストリーミングレスポンス
- Prisma Edge (`@/libs/prisma/edge`) を使用
- **移行の難易度:** 困難（Edge Runtime + SSEはGraphQLの通常モデルと非互換）
- **現状維持が妥当**

### 3-5. CSV Export
**ファイル:** `apps/web/src/pages/api/export/csv.ts`

- Prisma直接で全シート+ブック取得→CSV生成→ダウンロード
- **移行の難易度:** 低（データ取得をGraphQL化可能）だが、ファイルダウンロードはREST APIに残すのが適切
- **現状維持が妥当**

### 3-6. Books PUT/DELETE（API Route経由）
**ファイル:** `apps/web/src/pages/api/books/index.ts`

- graphqlClient経由でGraphQL APIを呼び出し済み
- API Routeが残る理由: PUT時の画像アップロード（Vercel Blob）処理がある、ISRキャッシュの`revalidate`呼び出し
- **Apollo Client直接化の障壁:** 画像アップロード処理をどこに置くか、ISR revalidationをどう行うか

---

## 4. SSR/ISRページの直接Prismaアクセス

ISR/SSGのためにサーバーサイドで直接DBアクセスしているページ。パフォーマンス要件上、直接アクセスが妥当だが、GraphQL queryが整備されたため移行も可能。

| ページ | Prisma操作 | 用途 |
|---|---|---|
| `pages/index.tsx` | `prisma.books.findMany()` | トップページの公開メモ一覧（ISR 5s） |
| `pages/books/[bookId].tsx` | `prisma.books.findFirst()` | 本の詳細（ISR 60s） |
| `pages/[user]/sheets/index.tsx` | `prisma.sheets.findMany()` | ユーザーのシート一覧（SSR→リダイレクト） |
| `pages/[user]/sheets/[year].tsx` | `prisma.user.findUnique()` 他5クエリ | 個別シートページ（ISR 5s） |
| `pages/[user]/sheets/total.tsx` | `prisma.user.findUnique()` 他5クエリ | 統計ページ（ISR 5s） |

---

## 5. GraphQL移行対象外のAPIルート

以下はDB CRUD操作ではないか、外部サービス連携のためREST APIに残すのが適切。

| ルート | 用途 | 備考 |
|---|---|---|
| `api/auth/[...nextauth].ts` | NextAuth認証 | フレームワーク要件 |
| `api/auth/init.ts` | セッション確認 | 単純なセッション検証 |
| `api/graphql.ts` | GraphQLプロキシ | プロキシ層そのもの（公開クエリ対応済み） |
| `api/stripe/create-payment-intent.ts` | Stripe決済 | 外部サービス連携 |
| `api/stripe/webhook.ts` | Stripe Webhook | 外部サービスコールバック |
| `api/admin/batch/software-design.ts` | 管理バッチ→NestJS REST | 既にNestJSバックエンドを呼び出し |
| `api/batch/vercel_blob.ts` | 管理用Blob操作 | インフラ管理ツール |
| `api/search/google-books.ts` | Google Books検索 | **移行済み** — GraphQL経由 |
| `api/search/shelf.ts` | 本の検索 | **移行済み** — GraphQL経由 |

---

## 6. 今後の移行優先度

### 高優先度
1. **Books一覧（`[sheet].ts`）のApollo Client直接化** — フロントエンド`Book`型のcamelCase統一が前提。影響範囲が広いが、snake_case/camelCase混在の技術的負債を解消する効果が大きい
2. **Books PUT/DELETEのApollo Client直接化** — 画像アップロード処理の分離（UploadリンクまたはPresigned URL方式）とISR revalidation方式の検討が必要

### 中優先度
3. **Books CREATE / Template Books POSTのGraphQL化** — 画像アップロードフローの設計見直し（共通パターンなのでまとめて対応）
4. **CSV ExportのGraphQL化** — データ取得部分のみ。ファイル生成・ダウンロードはAPI Routeに残す

### 低優先度（現状維持が妥当）
5. **AI Summary CREATE（ストリーミング）** — Edge Runtime + SSEはGraphQL移行困難
6. **SSR/ISRの直接Prismaアクセス** — パフォーマンス要件上、直接アクセスが妥当

---

## 7. 前回レポートからの変更点

1. **バックエンドGraphQL API大幅拡充**: User（4操作）, YearlyTopBook（3操作）, AiSummaries（3操作）, TemplateBooks（2操作）のリゾルバーを追加。Query 11→18、Mutation 8→16に増加
2. **API Route大量削除**: `yearly.ts`, `me.ts`, `user/index.ts`, `user/image.ts`, `check/name.ts`, `ai-summary/usage.ts`, `ai-summary/save.ts` を削除。フロントエンドからApollo Client直接呼び出しに置き換え
3. **Apollo Client直接呼び出し化**: YearlyTopBooks, ProfilePage, Tabs, Confirm, Template, useAiHelpersの各コンポーネントを`useSWR`/`fetch`からApollo Clientフックに移行
4. **`/api/graphql`プロキシ改善**: 未認証リクエストを公開APIとして転送する機能を追加（`userImage`等の公開クエリ対応）
5. **template/books.ts簡素化**: GET/DELETEを削除し、POSTのみに変更
6. **GraphQL定義ファイル構成追加**: `features/user/api/`, `features/template/api/`を新設
7. **移行優先度再評価**: 大部分の移行が完了し、残存はBooks関連（画像アップロード問題）とストリーミング・SSR/ISRのみ
