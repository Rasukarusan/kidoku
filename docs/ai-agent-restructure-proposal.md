# AIエージェントフレンドリーなリポジトリ構造改善提案

> 調査日: 2026-02-21
> 対象リポジトリ: kidoku（読書記録・分析アプリケーション）

## 目次

- [現状分析](#現状分析)
- [課題一覧](#課題一覧)
- [改善提案](#改善提案)
  - [Phase 1: CLAUDE.mdの抜本的強化](#phase-1-claudemdの抜本的強化)
  - [Phase 2: テスト基盤の構築](#phase-2-テスト基盤の構築)
  - [Phase 3: CI/CD（PR検証ワークフロー）](#phase-3-cicdpr検証ワークフロー)
  - [Phase 4: 開発ガードレール](#phase-4-開発ガードレール)
  - [Phase 5: Turborepoタスク整備](#phase-5-turborepoタスク整備)
- [補足: 各Phaseの詳細実装ガイド](#補足-各phaseの詳細実装ガイド)

---

## 現状分析

### リポジトリ構成

```
kidoku/
├── apps/
│   ├── api/          # NestJS GraphQL API (DDD構成)
│   │   ├── src/
│   │   │   ├── domain/           # ドメイン層 (models, repositories, types)
│   │   │   ├── application/      # アプリケーション層 (usecases)
│   │   │   ├── infrastructure/   # インフラ層 (auth, database, repositories, search)
│   │   │   ├── presentation/     # プレゼンテーション層 (resolvers, dto, modules)
│   │   │   ├── shared/           # 横断的関心事 (constants)
│   │   │   └── scripts/          # 運用スクリプト
│   │   └── test/                 # E2Eテスト (デフォルトのみ)
│   └── web/          # Next.js 14 フロントエンド
│       ├── src/
│       │   ├── components/       # 共通UIコンポーネント
│       │   ├── features/         # 機能別モジュール
│       │   ├── hooks/            # カスタムhooks
│       │   ├── libs/             # 外部ライブラリ統合
│       │   ├── pages/            # Next.js Pages Router
│       │   ├── store/            # 状態管理 (Jotai)
│       │   ├── types/            # 型定義
│       │   └── utils/            # ユーティリティ
│       └── prisma/               # Prismaスキーマ・マイグレーション
├── docker/                       # MeiliSearch, MySQL設定
├── docs/                         # ドキュメント
├── scripts/                      # シードスクリプト
├── .github/workflows/            # deploy-api.yml のみ
└── CLAUDE.md                     # AIエージェント向けガイド
```

### 良い点（維持すべき）

1. **APIのDDDアーキテクチャ**: domain/application/infrastructure/presentationの4層分離が明確
2. **ドメインモデル設計**: private constructor + factory methods (create/fromDatabase) パターンが一貫している
3. **DIパターン**: abstract classをインターフェースとして使用し、NestJSモジュールで`provide/useClass`で注入
4. **CLAUDE.md**: アーキテクチャ概要、コマンド一覧、トラブルシューティングが既に記載
5. **モノレポ構成**: Turborepo + pnpmで整理されている

### コード規模

| エリア | ファイル数 | 主な内容 |
|--------|-----------|---------|
| `apps/api/src/` | 約75ファイル | DDD構成のGraphQL API |
| `apps/web/src/` | 約196ファイル | Next.js Pages Router + Feature-based構成 |
| テストファイル | **2ファイル** | `migrator.test.ts`, `string.test.ts` のみ |
| CIワークフロー | 1ファイル | デプロイ用のみ（PR検証なし）|

---

## 課題一覧

### 課題1: テストがほぼ存在しない ★★★ 最重要

プロジェクト全体でテストファイルが **2つだけ** 。

- `apps/web/src/features/sheet/components/AiSummaries/migrator.test.ts`
- `apps/web/src/utils/string.test.ts`

APIの `test/app.e2e-spec.ts` はNestJSのデフォルトが残っているだけ。

**影響**: AIエージェントは変更の正しさを検証する手段がなく、リグレッションを検出できない。特にドメインモデルのバリデーションロジック（Book.createのタイトル必須チェック、最大文字数チェック等）やユースケースの結合テストが存在しないため、ビジネスロジック変更時の安全ネットがゼロ。

### 課題2: PRに対するCIが存在しない ★★★

`.github/workflows/` には `deploy-api.yml`（mainブランチpush時のCloud Runデプロイ）しか存在しない。

**影響**: lint・型チェック・テストをPRで自動実行するワークフローがないため、AIエージェントの変更に対するフィードバックループが存在しない。

### 課題3: CLAUDE.mdが「作業手順書」になっていない ★★☆

現在のCLAUDE.mdはアーキテクチャの概要説明としては良いが、AIエージェントが「新機能を追加する」「バグを修正する」際の具体的な手順が欠けている。

**欠けている情報**:

- 新しいGraphQLエンドポイントを追加する際のステップバイステップガイド
  - どのファイルをどの順序で作成/編集するか
  - ファイル命名規約
  - 必ず更新が必要なファイル（module.ts、app.module.ts等）
- DDDパターンの具体的なチートシート
  - ドメインモデルのテンプレート
  - リポジトリインターフェースのテンプレート
  - ユースケースのテンプレート
- テストの書き方パターン
- よくあるミス・禁止事項の一覧
- Dual ORMスキーマ同期の具体的手順（どのファイルをどう変更するか）

### 課題4: Dual ORM問題の曖昧なドキュメント ★★☆

同一MySQLに対してフロントエンド(Prisma)とバックエンド(Drizzle)で2つのORMが使われている。CLAUDE.mdに「手動で同期が必要」と記載はあるが、具体的にどのファイルをどう同期するかが不明確。

**関連ファイル**:
- Prismaスキーマ: `apps/web/prisma/schema.prisma`
- Drizzleスキーマ: `apps/api/src/infrastructure/database/schema/*.schema.ts`（9ファイル）

AIエージェントがPrisma側だけ更新してDrizzle側を忘れる（またはその逆）リスクが高い。

### 課題5: バリデーションの一括実行手段がない ★★☆

`pnpm lint`, `pnpm check-types`, テスト(`pnpm --filter web test`, `pnpm --filter api test`)は個別に存在するが、push前に全チェックを一括実行する統合コマンドがない。

CLAUDE.mdで「pushする前にpnpm lint:fixを行ってください」と書かれているが、lint:fix以外のチェック（型チェック、テスト）が含まれていない。huskyのpre-pushフックでも強制されていない。

### 課題6: ESLint設定が統一されていない ★☆☆

| アプリ | 設定ファイル | 形式 |
|--------|-------------|------|
| `apps/web` | `.eslintrc` | JSON (レガシーフォーマット) |
| `apps/api` | `eslint.config.mjs` | flat config (新形式) |

AIエージェントがESLint設定を変更する際に混乱する可能性がある。ただし個別のアプリ内で閉じているので、実害は限定的。

### 課題7: TypeScript strictモードがwebで無効 ★☆☆

`apps/web/tsconfig.json` で `"strict": true` が設定されていない（`"strictNullChecks"` 等も無効）。AIエージェントが型安全でないコードを書いても、型チェックで検出されにくい。

### 課題8: .claude/settings.json が空 ★☆☆

```json
{}
```

Claude Code固有の設定（許可コマンド、カスタム指示等）が未設定。

### 課題9: turbo.jsonにtestタスクが未定義 ★☆☆

```json
{
  "tasks": {
    "build": { ... },
    "lint": { ... },
    "lint:fix": { ... },
    "check-types": { ... },
    "dev": { ... }
    // "test" がない
  }
}
```

`pnpm test` がTurborepoで管理されておらず、キャッシュや依存関係管理が効かない。

---

## 改善提案

### Phase 1: CLAUDE.mdの抜本的強化

**目的**: AIエージェントが「何を」「どこに」「どの順序で」変更すべきか迷わないようにする

**追加すべきセクション**:

#### 1-1. コーディング規約

```markdown
## コーディング規約

### ファイル命名
- ケバブケース: `create-book.ts`, `book.ts`, `injection-tokens.ts`
- 1ファイル1責務: 1つのクラス/モジュールに対して1ファイル
- テストファイル: `*.spec.ts`（API）, `*.test.ts`（Web）

### ドメインモデル
- private constructor + static factory methods パターンを使用
- `create()`: 新規作成（バリデーション込み）
- `fromDatabase()`: DB復元（バリデーションなし）
- フィールドはprivate、getterのみ公開
- 更新は `update()` メソッド経由

### リポジトリ
- `domain/repositories/` に abstract class として定義
- `infrastructure/repositories/` に実装
- NestJSモジュールで `{ provide: IXxxRepository, useClass: XxxRepository }` でDI

### ユースケース
- `application/usecases/{feature}/` に配置
- `@Injectable()` デコレータ必須
- コンストラクタでリポジトリを注入
- `execute()` メソッドに処理を実装
```

#### 1-2. 新しいGraphQLエンドポイント追加手順

```markdown
## 新しいGraphQLエンドポイント（CRUD）の追加手順

例: `Tag` エンティティを追加する場合

### Step 1: ドメインモデル作成
ファイル: `apps/api/src/domain/models/tag.ts`
- private constructor + create() + fromDatabase() パターン

### Step 2: リポジトリインターフェース作成
ファイル: `apps/api/src/domain/repositories/tag.ts`
- abstract class ITagRepository

### Step 3: リポジトリ実装
ファイル: `apps/api/src/infrastructure/repositories/tag.ts`
- @Injectable() + ITagRepository を implements

### Step 4: Drizzleスキーマ追加
ファイル: `apps/api/src/infrastructure/database/schema/tags.schema.ts`
- テーブル定義
- `schema/index.ts` にexport追加

### Step 5: ユースケース作成
ファイル: `apps/api/src/application/usecases/tags/*.ts`
- create-tag.ts, get-tags.ts, update-tag.ts, delete-tag.ts

### Step 6: DTO作成
ファイル: `apps/api/src/presentation/dto/tag.ts`
- @InputType, @ObjectType

### Step 7: リゾルバー作成
ファイル: `apps/api/src/presentation/resolvers/tag.ts`
- @Resolver + @Query/@Mutation

### Step 8: モジュール作成
ファイル: `apps/api/src/presentation/modules/tag.ts`
- imports, providers, provide/useClass

### Step 9: AppModuleに登録
ファイル: `apps/api/src/app.module.ts`
- imports に TagModule 追加

### Step 10: テスト作成
- ドメインモデルのユニットテスト
- ユースケースのユニットテスト

### Step 11: Prismaスキーマとの同期（DBスキーマ変更時）
1. `apps/web/prisma/schema.prisma` にモデル追加
2. `pnpm --filter web db:push` でDB反映
3. Drizzleスキーマも上記Step 4で同期済み
4. `pnpm --filter api db:push`
```

#### 1-3. スキーマ同期ガイド

```markdown
## Prisma ⇔ Drizzle スキーマ同期

同一MySQLに対してPrisma(web)とDrizzle(api)の2つのORMを使用しているため、
スキーマ変更時は**必ず両方を更新**する。

### 対応表

| Prismaスキーマ (`apps/web/prisma/schema.prisma`) | Drizzleスキーマ (`apps/api/src/infrastructure/database/schema/`) |
|--------------------------------------------------|-------------------------------------------------------------------|
| model books { ... }                              | `books.schema.ts`                                                 |
| model sheets { ... }                             | `sheets.schema.ts`                                                |
| model User { ... }                               | `users.schema.ts`                                                 |
| model Account { ... }                            | `accounts.schema.ts`                                              |
| model Session { ... }                            | `sessions.schema.ts`                                              |
| model VerificationToken { ... }                  | `verificationtokens.schema.ts`                                    |
| model template_books { ... }                     | `template-books.schema.ts`                                        |
| model ai_summaries { ... }                       | `ai-summaries.schema.ts`                                          |
| model yearly_top_books { ... }                   | `yearly-top-books.schema.ts`                                      |

### 変更手順
1. Prismaスキーマ (`schema.prisma`) を編集
2. `pnpm --filter web db:push` でDBに反映
3. 対応するDrizzleスキーマファイルを手動で同期
4. `pnpm --filter api db:push` でバックエンドも更新
5. `pnpm --filter web prisma generate` でPrismaクライアント再生成
```

#### 1-4. 禁止事項・よくあるミス

```markdown
## 禁止事項・よくあるミス

### レイヤー依存ルール（厳守）
- ❌ domain/ から infrastructure/ や presentation/ をimportしない
- ❌ application/ から infrastructure/ や presentation/ をimportしない
- ❌ presentation/ から infrastructure/repositories/ を直接使わない（ユースケース経由）
- ✅ infrastructure/ → domain/ (リポジトリ実装がドメインモデルを使用)
- ✅ application/ → domain/ (ユースケースがドメインモデル・リポジトリを使用)
- ✅ presentation/ → application/ + domain/ (リゾルバーがユースケースを呼び出し)

### スキーマ変更
- ❌ Prismaだけ変更してDrizzleを忘れる（またはその逆）
- ❌ スキーマ変更後に `db:push` を忘れる

### NestJS DI
- ❌ モジュールのprovidersに登録せずにクラスを@Injectする
- ❌ AppModuleにモジュールを追加し忘れる

### GraphQL
- ❌ リゾルバー変更後にフロントエンドの codegen を忘れる
  → `pnpm --filter web codegen` で型を再生成すること
```

### Phase 2: テスト基盤の構築

**目的**: AIエージェントが変更を検証でき、新しいテストを書く際の「テンプレート」を提供する

#### 2-1. ドメインモデルのユニットテスト

```
apps/api/src/domain/models/__tests__/
├── book.spec.ts        # Book.create, update, getSanitizedMemo
├── sheet.spec.ts       # Sheet.create, update
├── comment.spec.ts     # Comment のテスト
└── software-design.spec.ts
```

**テスト例** (`book.spec.ts`):

```typescript
import { Book } from '../book';

describe('Book', () => {
  describe('create', () => {
    it('有効なパラメータで書籍を作成できる', () => {
      const book = Book.create({
        userId: 'user-1',
        sheetId: 1,
        title: 'テスト書籍',
        author: 'テスト著者',
        category: '技術書',
        image: 'https://example.com/image.jpg',
        impression: '★★★',
        memo: 'メモ',
        isPublicMemo: false,
        finished: new Date('2025-01-01'),
      });

      expect(book.title).toBe('テスト書籍');
      expect(book.author).toBe('テスト著者');
      expect(book.id).toBeNull(); // 未永続化
    });

    it('タイトルが空の場合エラーになる', () => {
      expect(() =>
        Book.create({
          userId: 'user-1',
          sheetId: 1,
          title: '',
          author: '',
          category: '',
          image: '',
          impression: '',
          memo: '',
          isPublicMemo: false,
          finished: null,
        }),
      ).toThrow('書籍タイトルは必須です');
    });

    it('タイトルが100文字を超える場合エラーになる', () => {
      expect(() =>
        Book.create({
          userId: 'user-1',
          sheetId: 1,
          title: 'a'.repeat(101),
          author: '',
          category: '',
          image: '',
          impression: '',
          memo: '',
          isPublicMemo: false,
          finished: null,
        }),
      ).toThrow('タイトルは100文字以下で入力してください');
    });
  });

  describe('getSanitizedMemo', () => {
    it('所有者は全メモを閲覧できる', () => {
      const book = Book.fromDatabase(
        '1', 'user-1', 1, 'title', 'author', 'category',
        'image', 'impression', '秘密のメモ', false, false,
        null, new Date(), new Date(),
      );
      expect(book.getSanitizedMemo(true)).toBe('秘密のメモ');
    });

    it('非所有者は非公開メモを閲覧できない', () => {
      const book = Book.fromDatabase(
        '1', 'user-1', 1, 'title', 'author', 'category',
        'image', 'impression', '秘密のメモ', false, false,
        null, new Date(), new Date(),
      );
      expect(book.getSanitizedMemo(false)).toBeNull();
    });

    it('非所有者は公開メモをマスキングされた状態で閲覧できる', () => {
      const book = Book.fromDatabase(
        '1', 'user-1', 1, 'title', 'author', 'category',
        'image', 'impression', '公開メモ', true, false,
        null, new Date(), new Date(),
      );
      const sanitized = book.getSanitizedMemo(false);
      expect(sanitized).not.toBe('公開メモ'); // マスキングされている
      expect(sanitized).toContain('公'); // 先頭は見える
    });
  });
});
```

#### 2-2. ユースケースのユニットテスト

```
apps/api/src/application/usecases/books/__tests__/
└── create-book.spec.ts
```

**テスト例** (`create-book.spec.ts`):

```typescript
import { CreateBookUseCase } from '../create-book';
import { IBookRepository } from '../../../../domain/repositories/book';
import { ISearchRepository } from '../../../../domain/repositories/search';
import { Book } from '../../../../domain/models/book';

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;
  let mockSearchRepo: jest.Mocked<ISearchRepository>;

  beforeEach(() => {
    mockBookRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySheetId: jest.fn(),
      findByUserIdAndSheetId: jest.fn(),
      delete: jest.fn(),
      findAllForSearch: jest.fn(),
      findForSearchById: jest.fn(),
      getCategories: jest.fn(),
    } as any;

    mockSearchRepo = {
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      search: jest.fn(),
      indexAllDocuments: jest.fn(),
    } as any;

    useCase = new CreateBookUseCase(mockBookRepo, mockSearchRepo);
  });

  it('書籍を作成しMeiliSearchにインデックスする', async () => {
    const savedBook = Book.fromDatabase(
      '1', 'user-1', 1, 'テスト書籍', '著者', 'カテゴリ',
      'image.jpg', '★', 'メモ', false, false,
      null, new Date(), new Date(),
    );

    mockBookRepo.save.mockResolvedValue(savedBook);
    mockBookRepo.findForSearchById.mockResolvedValue({
      id: '1', title: 'テスト書籍', author: '著者',
      image: 'image.jpg', memo: '', isPublicMemo: false,
      userName: 'user', userImage: null, sheetName: 'シート1',
    });

    const result = await useCase.execute({
      userId: 'user-1',
      sheetId: 1,
      title: 'テスト書籍',
      author: '著者',
      category: 'カテゴリ',
      image: 'image.jpg',
      impression: '★',
      memo: 'メモ',
      isPublicMemo: false,
      finished: null,
    });

    expect(result.title).toBe('テスト書籍');
    expect(mockBookRepo.save).toHaveBeenCalled();
    expect(mockSearchRepo.updateDocument).toHaveBeenCalled();
  });
});
```

#### 2-3. テストヘルパー

```
apps/api/src/__tests__/
├── helpers/
│   └── factory.ts      # テストデータ生成ファクトリ
└── setup.ts             # テストセットアップ
```

### Phase 3: CI/CD（PR検証ワークフロー）

**目的**: PR作成時に自動でlint・型チェック・テストを実行し、AIエージェントにフィードバックを提供

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, master]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm check-types

  test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api test

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web test
```

### Phase 4: 開発ガードレール

**目的**: push前に問題を自動検出する仕組みを整備

#### 4-1. `validate` コマンド追加

```jsonc
// package.json (root)
{
  "scripts": {
    "validate": "turbo run lint check-types test"
  }
}
```

#### 4-2. husky pre-push hook

```bash
# .husky/pre-push
pnpm validate
```

#### 4-3. .claude/settings.json

```jsonc
{
  "permissions": {
    "allow": [
      "Bash(pnpm lint:fix)",
      "Bash(pnpm lint)",
      "Bash(pnpm check-types)",
      "Bash(pnpm validate)",
      "Bash(pnpm --filter api test)",
      "Bash(pnpm --filter web test)",
      "Bash(pnpm --filter api test:watch)",
      "Bash(pnpm --filter web test:w)",
      "Bash(pnpm build)",
      "Bash(pnpm --filter web build)",
      "Bash(pnpm --filter api build)",
      "Bash(pnpm --filter web codegen)",
      "Bash(pnpm --filter web prisma generate)",
      "Bash(pnpm --filter web db:push)",
      "Bash(pnpm --filter api db:push)",
      "Bash(pnpm dev)",
      "Bash(pnpm --filter web dev)",
      "Bash(pnpm --filter api dev)"
    ]
  }
}
```

### Phase 5: Turborepoタスク整備

**目的**: テストをTurborepoのタスクとして管理し、キャッシュと依存関係を最適化

```jsonc
// turbo.json
{
  "tasks": {
    "build": { ... },
    "lint": { ... },
    "lint:fix": { ... },
    "check-types": { ... },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "test/**", "jest.config.*", "tsconfig.json"],
      "outputs": ["coverage/**"]
    },
    "validate": {
      "dependsOn": ["lint", "check-types", "test"]
    },
    "dev": { ... }
  }
}
```

---

## 補足: 各Phaseの詳細実装ガイド

### 実装優先度とインパクト

| Phase | 内容 | 工数 | インパクト | 依存関係 |
|-------|------|------|-----------|----------|
| **Phase 1** | CLAUDE.md強化 | 小 | ★★★ | なし |
| **Phase 2** | テスト基盤構築 | 中 | ★★★ | なし |
| **Phase 3** | CI/CDワークフロー | 小 | ★★☆ | Phase 2のテストが必要 |
| **Phase 4** | 開発ガードレール | 小 | ★★☆ | Phase 2, 5が先にあると効果的 |
| **Phase 5** | Turborepoタスク整備 | 小 | ★☆☆ | Phase 2のテストが必要 |

### 推奨実装順序

1. **Phase 1 → Phase 2** を先行（AIエージェントへの直接的な効果が最大）
2. **Phase 5 → Phase 3 → Phase 4** を後続（CI/自動化基盤）

### Phase 1 の CLAUDE.md 変更後の構成イメージ

```
CLAUDE.md
├── 重要（push前の手順）
├── プロジェクト概要
├── アーキテクチャ概要
│   ├── 認証フロー
│   ├── データベースアクセス
│   └── API アーキテクチャ（DDD）
├── ★ コーディング規約                    ← NEW
│   ├── ファイル命名規約
│   ├── ドメインモデルパターン
│   ├── リポジトリパターン
│   ├── ユースケースパターン
│   └── レイヤー依存ルール
├── ★ 機能追加ガイド                      ← NEW
│   ├── 新しいGraphQLエンドポイント追加手順
│   ├── 新しいフロントエンドページ追加手順
│   └── DBスキーマ変更手順（Prisma⇔Drizzle同期）
├── ★ テストガイド                        ← NEW
│   ├── テストファイルの配置規約
│   ├── ドメインモデルテストの書き方
│   └── ユースケーステストの書き方
├── ★ 禁止事項・よくあるミス              ← NEW
├── 開発コマンド
├── 重要ファイル・ディレクトリ
├── ★ Prisma⇔Drizzle対応表               ← NEW
├── 開発時の注意事項
├── サンドボックス環境での開発
└── トラブルシューティング
```

### 将来的な改善候補（本提案のスコープ外）

- **共有パッケージ (`packages/`)** の導入: web/api間で共有する型定義を `packages/shared-types` に切り出し
- **ORMの統一**: Prisma or Drizzle のどちらかに統一してスキーマ同期問題を根本解決
- **TypeScript strict mode 有効化** (web): 段階的に `strict: true` に移行
- **ESLint設定統一**: 共有ESLint config パッケージの作成
- **E2Eテスト**: Playwright を使ったフロントエンドE2Eテスト
- **APIインテグレーションテスト**: テスト用DBを使ったリポジトリ実装のテスト
