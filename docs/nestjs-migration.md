# Software Design API - NestJS移行ガイド

このドキュメントでは、Software Design APIをNext.js APIからNestJSへ移行した内容について説明します。

## 移行内容

### 1. モジュール構成

NestJSのモジュラー構造に従い、以下のファイルを作成しました：

```
apps/api/src/modules/software-design/
├── dto/
│   ├── software-design.object.ts     # GraphQLオブジェクト型定義
│   └── get-software-design.input.ts   # GraphQL入力型定義
├── software-design.module.ts          # モジュール定義
├── software-design.service.ts         # ビジネスロジック
├── software-design.resolver.ts        # GraphQLリゾルバー
├── software-design.controller.ts      # REST APIコントローラー
└── __tests__/
    └── software-design.service.spec.ts # ユニットテスト
```

### 2. GraphQL API

#### クエリ

```graphql
# 最新号を取得
query GetLatestSoftwareDesign {
  latestSoftwareDesign {
    id
    title
    author
    category
    image
    memo
    isbn
  }
}

# 特定の年月号を取得
query GetSoftwareDesignByMonth($year: Int!, $month: Int!) {
  softwareDesignByMonth(year: $year, month: $month) {
    id
    title
    author
    category
    image
    memo
    isbn
  }
}

# 年間リストを取得
query GetSoftwareDesignByYear($input: GetSoftwareDesignInput!) {
  softwareDesignByYear(input: $input) {
    items {
      id
      title
      author
      category
      image
      memo
      isbn
    }
    total
  }
}

# ISBN検索
query SearchSoftwareDesignByISBN($isbn: String!, $year: Int, $month: Int) {
  searchSoftwareDesignByISBN(isbn: $isbn, year: $year, month: $month) {
    id
    title
    author
    category
    image
    memo
    isbn
  }
}
```

### 3. REST API（バッチ処理）

管理者用のバッチ処理エンドポイント：

```
POST /api/software-design/batch/add-latest
Headers: Authorization: Bearer {JWT_TOKEN}
```

レスポンス例：
```json
{
  "success": true,
  "message": "Latest Software Design added as template",
  "data": {
    "id": 1,
    "name": "Software Design 2025年7月号",
    "title": "Software Design 2025年7月号",
    "author": "技術評論社",
    "category": "プログラミング/技術雑誌",
    "image": "https://gihyo.jp/assets/images/cover/2025/thumb/TH800_642507.jpg",
    "memo": "自動追加: 2025/6/20\nISBN: 978-4-297-12345"
  }
}
```

### 4. フロントエンドでの使用方法

#### React Hooks

`src/hooks/useSoftwareDesign.ts`を使用してGraphQL APIにアクセス：

```typescript
import { useLatestSoftwareDesign, useSoftwareDesignByMonth } from '@/hooks/useSoftwareDesign';

// 最新号を取得
const { softwareDesign, loading, error } = useLatestSoftwareDesign();

// 特定の年月号を取得
const { softwareDesign } = useSoftwareDesignByMonth(2025, 7);
```

#### Apollo Clientでの直接クエリ

```typescript
import { gql, useApolloClient } from '@apollo/client';

const client = useApolloClient();

const result = await client.query({
  query: gql`
    query SearchSoftwareDesignByISBN($isbn: String!) {
      searchSoftwareDesignByISBN(isbn: $isbn) {
        id
        title
        author
        category
        image
        memo
        isbn
      }
    }
  `,
  variables: { isbn: '978-4-297-14815-7' },
});
```

## 移行時の変更点

### 1. 認証方式

- Next.js API: `getSession({ req })`を使用したセッション認証
- NestJS GraphQL: JWTトークンによる認証（`@UseGuards(GqlAuthGuard)`）
- NestJS REST: JWTトークンによる認証（`@UseGuards(JwtAuthGuard)`）

### 2. エラーハンドリング

- Next.js API: HTTPステータスコードとJSONレスポンス
- NestJS: 例外フィルターとGraphQLエラー

### 3. データベースアクセス

- Next.js API: Prisma ORMを直接使用
- NestJS: Drizzle ORMをDependency Injectionで使用

## テスト

NestJSのテストフレームワークを使用：

```bash
cd apps/api
npm test src/modules/software-design/__tests__/software-design.service.spec.ts
```

## 今後の改善点

1. **キャッシング**: Redisを使用した画像URLのキャッシング
2. **実際のISBN取得**: 技術評論社のサイトから最新号のISBNを自動取得
3. **画像検証**: 画像URLの有効性を確認する処理の追加
4. **バッチ処理の定期実行**: Cronジョブによる自動実行