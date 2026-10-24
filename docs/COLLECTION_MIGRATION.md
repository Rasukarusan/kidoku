# コレクションモデルへの切り替え

## 保存先と互換性

正規の保存先は `collections`, `items`, `item_types`, `collection_items`, `item_logs`, `item_templates`。
本の既存ID・メモ・公開設定・価格・コメント・購入参照を保持する。
旧PrismaモデルはSQLビューを読む互換層であり、ビューを更新するコードを追加してはいけない。
新規コードは正規モデルとコレクション用GraphQL APIを使用する。

Prismaの両スキーマは同じ内容にする。`views` は既存APIとの互換用途で使う。
`prisma db push` はこの移行に使用しない。リネームを削除・新規作成として推測するため、データを失う。
DBワークフローも自動変更を廃止し、正規テーブルと互換ビューの存在確認のみ行う。

## 新しい空DBの作成

両Prismaクライアントを生成し、`pnpm --filter web db:initialize` を実行する。
正規テーブル、最初の種類定義、互換ビューを一緒に作成する。既存データがあるDBへの初期化は拒否する。
以後は `pnpm --filter web db:check` でスキーマを確認する。

## 既存環境への適用

1. ステージングに既存DBのバックアップを復元する。
2. そのDBを指す `DATABASE_URL` を設定し、WebのPrismaクライアントを生成する。
3. `node scripts/migrate-collections.mjs` を実行する。既定は読み取りのみの事前検査。
4. 他ユーザーのシートへの所属、孤立した年間ベスト、NULLのコレクション日時・順序があれば解決する。行は自動削除しない。
5. 全ライター（Web/API、バッチ、インポート、外部クライアント）を停止し、バックアップを取得して復元可能なことを確認する。
6. `node scripts/migrate-collections.mjs --apply --writers-stopped --backup-verified` を実行する。
7. 両クライアントを生成し、新旧を混在させず、この変更と対応するWeb/APIを切り替える。
8. `node scripts/verify-collection-schema.mjs` を実行し、以下の動作確認を行ってから書き込みを再開する。
9. ステージングで手順と復元を検証した後、同じ手順を本番のメンテナンス時間に適用する。

SQLは [sql/collection-model.sql](./sql/collection-model.sql)。
MySQLのDDLはトランザクションで戻せない。途中失敗時はライターを停止したままバックアップから復元する。
部分適用したDBへ移行を再実行しない。スクリプトは正規テーブルを検出すると再実行を拒否する。
適用中の文番号は `.collection-migration-progress.json` に記録する。このファイルには秘密情報を保存しない。
書き込み再開後は新しい記録が発生するため、移行前バックアップへの単純な復元は行わず、別途データ保全を含む復旧計画を立てる。

## Preview環境での実行

GitHub ActionsのDB検証ワークフローで、対象ブランチ、`environment=Preview`、`operation=migrate-preview` を指定する。
`backup_certificate` にはバックアップ暗号化用のX.509公開証明書をbase64で渡し、対応する秘密鍵はローカルに保管する。

ジョブはPreview APIへの外部アクセスを止め、DBをバックアップする。
別DBへの復元結果を全テーブルの件数・データハッシュで照合し、復元したDBで移行を検証する。
暗号化バックアップをArtifactに保存し、接続先のデータがバックアップと一致することを確認してからPreview DBに適用する。
APIの再デプロイで外部アクセスを再開する。

バックアップの復号には `openssl cms -decrypt -binary -inform DER -in preview.sql.cms -inkey private.pem -out preview.sql` を使用する。

## 動作確認

- 本の既存ID・メモ・公開設定・価格・購入・コメントと旧URLが対応している。
- 汎用APIで映画を登録し、監督・公開年・上映時間を編集できる。
- アイテムを複数コレクションに所属させ、未所属にもできる。
- コレクションを削除してもアイテムと履歴が残る。
- 同じ映画の再鑑賞を追加するとアイテム数は増えず、履歴数が増える。
- 年・月の集計は履歴の実日付に従い、日付不明を月別グラフに含めない。
- 本以外の種類がBook APIと読書分析に入らない。
- 所有者以外には非公開のアイテムメモと履歴メモが返らない。
- 所有者以外のアイテム・コレクション・履歴への変更を拒否する。
- CSV・JSONエクスポートに、固有属性・複数所属・再読や再鑑賞の履歴が含まれる。

## 利用経路

- Web: `/:user/sheets/:name`、`/:user/sheets/total`、`/books/:id`。本の検索・登録は検索モーダルを使用する。
- GraphQL: `collections`, `itemTypes`, `items`, `item`, `saveCollection`, `deleteCollection`, `saveItem`, `deleteItem`, `saveItemLog`, `deleteItemLog`, `setCollectionHighlight`
- PATによる読み取り: `/api/v1/items`、`/api/v1/items/:itemId`
- MCP読み取り: `list_collections`, `list_items`, `get_item`。`list_books` / `get_book` は本のみを返す。
  汎用ツールには `items:read` 権限が必要。
- エクスポート: `/api/export/items`、`/api/export/items?format=json`

種類の追加は `item_types` に定義を追加する。定義はフィールド、履歴の種類・日時ラベル、単位を含む。
文字列・文字列配列・整数・真偽値の入力に対応する。外部検索やAIは許可済みハンドラーの実装が必要。
既存の属性定義を破壊的に変更するときは、`attributes_version` を更新するバックフィルを先に行う。
アプリから種類定義を書き換えるAPIは公開していない。

## 検証上の注意

単体テスト・型チェックと、MySQLでの移行検証・実画面の確認は区別する。
Prismaの型情報のみを生成した環境では、ネイティブエンジンとMySQL接続を必要とする検証は実行できない。
実施した検証結果は変更の報告に明記する。
