# Kidoku

https://kidoku.net/

<img width="1419" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/8e55ff56-d30e-4bf1-827d-16d144b0df3c">
<img width="1420" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/542fc3fd-319f-4777-a011-ffeb36022338">


## 機能

- 本の検索
- ユーザー本棚の検索
- 2022年、2023年などシートごとの本の管理
- 月ごとの冊数、カテゴリ内訳、本の感想、

## 目的

- スプレッドシートで記録していたのをWebアプリ化
- ビジュアライズして楽しくしたい

<img width="957" alt="image" src="https://user-images.githubusercontent.com/17779386/178728788-8395242c-dee1-4338-babd-20d04855ed97.png">

## 技術

- Next.js
- Tailwind
- NextAuth
- Prisma
- Framer Motion
- Recoil
- TiDB
- MeiliSearch
- Resend

## 環境構築

envファイルの作成
```sh
cp .env.example .env
```

画面アクセス
```sh
yarn
yarn dev
open http://localhost:3000
```

検索環境(meilisearch)構築
```sh
docker-compose up --build

# meiliearchが構築できていることを確認
open http://localhost:7700

# ドキュメント登録
curl -XPOST -H "Authorization: Bearer ${ADMIN_AUTH_TOKEN}" http://localhost:3000/api/batch/meilisearch
# {"result":true}
```

## MeiliSearchの起動に失敗した場合

`dockuer-compose up`で下記のエラーが出てmeilisearchの起動に失敗した場合、`data/meilisearch`の`meilisearch`ディレクトリを削除すると起動できる。

```
Error: Meilisearch (v1.4.2) failed to infer the version of the database.
To update Meilisearch please follow our guide on https://www.meilisearch.com/docs/learn/update_and_migration/updating.
```

## Meilisearch エンドポイント

https://www.meilisearch.com/docs/reference/api/indexes

- index 作成

```sh
curl -XPOST -H "Authorization: Bearer YourMasterKey" -H 'Content-Type: application/json' -d '{"uid": "books", "primaryKey": "id"}' http://localhost:7700/indexes | jq
```

- 検索

日本語の場合は URL エンコード必要

```sh
curl -H "Authorization: Bearer YourMasterKey" "http://localhost:7700/indexes/books/search?q=soft" | jq
```

- 設定取得

```sh
curl -H "Authorization: Bearer YourMasterKey" http://localhost:7700/indexes/books/settings | jq
```

- 検索対象のカラム、表示するカラムを設定

```sh
curl -XPATCH -d '{"displayedAttributes": ["*"], "searchableAttributes": ["title", "memo", "author"]}' -H 'Content-Type: application/json' -H "Authorization: Bearer YourMasterKey" http://localhost:7700/indexes/books/settings | jq

```

- ドキュメント全削除

```sh
curl -XDELETE -H 'Content-Type: application/json' -H "Authorization: Bearer YourMasterKey" http://localhost:7700/indexes/books/documents
```
