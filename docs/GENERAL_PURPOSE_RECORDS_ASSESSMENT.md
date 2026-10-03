# 本以外の記録への拡張性調査

## 結論

シート名そのものは任意文字列なので、`2026` の代わりに `映画` や `出来事` を作るだけなら保存・表示はできる。シートのドメインモデルにも「4 桁の年でなければならない」という制約はない。

ただし、現在の設計では **シートが「分類」と「年」を兼ね、シート配下のレコードが常に「本」である**。そのため、名前だけを変えて本以外を登録すると直ちにデータが壊れるわけではないものの、集計、年間ベスト、AI 分析、検索・登録、公開ページの語彙が意味的に破綻する。汎用記録アプリにするなら、画面上の文言差し替えだけではなくドメインモデルを分離する必要がある。

## 現状のどこまでが汎用的か

### シート自体は任意名のコレクションとして利用できる

- `sheets.name` は `VARCHAR(120)` で、ユーザー内の一意制約しかない。年形式の DB 制約はない（`apps/api/prisma/schema.prisma`）。
- `Sheet.create` と `rename` の検証も「空でないこと」だけである（`apps/api/src/domain/models/sheet.ts`）。
- 公開ページはルートパラメーターを `year` と呼んでいるが、実際には `sheet.name === year` で検索している。したがって `/sheets/映画` 自体は成立する（`apps/web/src/pages/[user]/sheets/[year].tsx`）。

この範囲では `year` という変数名は誤解を招く命名上の負債であり、機能上の制約ではない。

## 破綻する箇所

### 1. レコードのスキーマが書籍専用（重大）

`books` は `title`、`author`、`category`、表紙画像、読了評価、`finished` を必須または中心属性として持つ（`apps/api/prisma/schema.prisma`）。ドメインモデルもタイトル未入力時に「書籍タイトルは必須です」と検証する（`apps/api/src/domain/models/book.ts`）。

- 映画では `author` を監督、`finished` を鑑賞日に読み替えることはできるが、命名と API 契約が嘘になる。
- 出来事には著者、表紙、読了、ISBN がそもそも対応しない。
- 種別固有属性（映画の上映時間・公開年・監督、出来事の場所・開始終了日時）を安全に追加できない。
- API、GraphQL、検索インデックス、いいね、コメント、購入などがすべて `Book` / `bookId` を公開契約にしており、後からの改名コストが増える。

このため、「映画だけを本と同じ項目で暫定管理」なら可能だが、「複数種別を正式サポート」する土台としては不十分である。

### 2. シート名を年として扱う集計（重大）

全体ページは、各シートの件数を「年ごとの読書数」に変換し、シート数で「年間平均読書数」を計算している（`apps/web/src/pages/[user]/sheets/total.tsx` と `apps/web/src/features/sheet/components/SheetTotal/SheetTotalPage.tsx`）。`映画` シートを追加すると、それも 1 年として分母に入る。

また、個別シートでは `year`（実体はシート名）をそのまま `yearly_top_books.year` の検索条件に使う（`apps/web/src/pages/[user]/sheets/[year].tsx`）。結果として `映画` という「年」の年間ベスト書籍を作れる状態になり、分類軸と期間軸が混ざる。

### 3. 日付の意味が「読了日」に固定（中〜重大）

月別グラフとサマリーは `finished` を読了月として扱い、未設定なら現在月へ入れる（`apps/web/src/pages/[user]/sheets/[year].tsx`）。これは次の問題を生む。

- 映画の鑑賞日や出来事の発生日を `finished` に入れる必要がある。
- 日付不明の過去記録が「今月」に混入する。
- 年シート `2026` に 2025 年の日付のレコードを入れても拒否されず、シート名と実日付が矛盾する。
- 複数日にまたがる出来事や再鑑賞・再読の履歴を表現できない。

### 4. 入力・検索経路が書籍に固定（重大）

登録 UI は「本を登録」「著者」を前提とし、タイトル・ISBN・Amazon URL 検索、書籍 API、バーコード読み取りへ分岐する（`apps/web/src/components/input/SearchBox/SearchModal.tsx` と `RegisterForm.tsx`）。映画や出来事には別の入力フォームが必要で、単なるラベル変更では対応できない。

### 5. 表示・分析・共有の意味が崩れる（中）

- 件数単位は「冊」、統計は「累計読書数」「年間平均読書数」「読んだ著者」で固定されている（`apps/web/src/features/sheet/components/SheetTotal/SheetTotalPage.tsx`、`LifetimeStats.tsx`）。
- 個別シートの要約は「合計 N 冊」「最も読んだ月」、ベストは「年間ベスト書籍」である（`apps/web/src/features/sheet/components/SheetPage.tsx`）。
- AI は読了本、読書履歴、読書性格としてプロンプトと結果スキーマが設計されている（`apps/api/src/application/usecases/ai-summaries/generate-ai-summary.ts` と `apps/web/src/features/sheet/components/AiSummaries/AiSummaries.tsx`）。
- OGP も「読書まとめ」「冊」「ジャンル」「ベストブック」で固定されている（`apps/web/src/pages/api/og.tsx`）。
- CSV / Markdown エクスポートも著者・読了日など書籍の列構成である（`apps/web/src/pages/api/export/csv.ts` と `markdown.ts`）。

保存できても、ユーザーに提示される意味は一貫しない。

### 6. URL と文字列の扱い（軽微だが先に直す価値あり）

動的ルート名が `[year]` であるほか、タブ遷移や登録成功後の遷移にはシート名を直接 URL へ埋め込む箇所がある（`apps/web/src/features/sheet/components/Tabs.tsx`、`apps/web/src/components/input/SearchBox/SearchModal.tsx`）。日本語は通常ブラウザー側で処理されるが、`/`、`?`、`#` などを含む名前を許すなら、全経路で `encodeURIComponent` を統一するか、不変の `sheetId` / `slug` を URL に使うべきである。

## 推奨モデル

### まず分離すべき概念

1. **Collection（旧 Sheet）**: ユーザーが任意に作る分類・ビュー。「2026」「映画」「旅行」など。
2. **Entry（旧 Book）**: 共通属性として `title`、`memo`、`image`、`rating`、`occurredAt`、公開設定を持つ記録。
3. **EntryType**: `BOOK`、`MOVIE`、`EVENT`。表示語彙、入力フォーム、検索プロバイダー、単位を決める。
4. **期間**: `occurredAt` から導出する年・月。Collection 名から推測しない。

「2026」と「映画」を同じ階層の排他的なシートにすると、「2026 年に観た映画」を表すためにどちらかを諦めることになる。したがって年はコレクションではなく日付フィルター（または保存済みビュー）にし、種別と期間を直交させるのが望ましい。

### 種別固有属性

初期段階では次のいずれかが現実的である。

- 少数の型を強くサポートするなら `book_details`、`movie_details`、`event_details` の 1:1 テーブルを作る。
- ユーザー定義型まで狙うなら `entries.metadata` を JSON とし、種別ごとのバリデーションスキーマをアプリ側に持つ。

検索・集計対象（監督、上映時間、場所など）が明確なら前者が安全である。JSON は導入が速い一方、DB 制約、索引、型安全性、移行が弱くなるため、何でも JSON に寄せる設計は避ける。

## 段階的な移行案

### Phase 0: 用語の負債を解消

- ルートを互換性を保ちながら `[year]` から `[sheet]` または `[collectionSlug]` へ移す。
- 内部変数 `year` を `sheetName` に改名する。
- URL は名前ではなく ID / slug を正規キーにし、名前は表示専用にする。
- 「年である」という検証が必要な年間ベスト等では `/^\d{4}$/` による明示的なガードを入れる。

### Phase 1: 年と分類を分離

- 集計年は `finished` を改名した `occurredAt` から導出する。
- 全体集計の分母をシート数ではなく、記録が存在する暦年数にする。
- `yearly_top_books.year` と sheet 名の暗黙の対応を廃止する。
- 既存の `2026` シートは Collection として残しつつ、移行時に年を解釈して日付との不整合をレポートする。

### Phase 2: Entry を導入

- 新しい `entries` と種別詳細テーブルを追加する。
- 既存 API を維持したまま、Book を Entry の `BOOK` 表現へ写すアダプターを置く。
- いいね、コメント、購入、AI サマリーの外部キーを段階的に `entryId` へ移行する。
- 十分な移行期間後に `books` 契約を非推奨化する。

### Phase 3: 種別対応 UI

- Collection または作成時に EntryType を選び、型別フォームを表示する。
- `BOOK` だけ ISBN / 書籍検索を使い、`MOVIE` は映画検索または手入力、`EVENT` は手入力と日時・場所を使う。
- 単位、ラベル、グラフ、AI プロンプト、OGP、エクスポートを EntryType ごとの設定から生成する。

## 判断基準

- **個人利用の暫定運用**: `author=監督`、`finished=鑑賞日` のような読み替えを許容できるなら「映画」シートは使える。ただし年間平均と年間ベストは信用しない。
- **映画も正式な第一級機能にする**: 最低でも EntryType、日付とシートの分離、型別 UI が必要。
- **出来事を含む汎用記録アプリにする**: `Book` を中心概念にしたまま拡張せず、Collection / Entry / EntryType へ移行すべき。

要するに、問題は「シート名に 2026 以外を入れられない」ことではない。**シート名を期間として使う設計と、配下データを Book に固定する設計が同時に存在すること**が破綻点である。
