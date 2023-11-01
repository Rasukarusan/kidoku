# Kidoku

https://app.rasukarusan.com/

<img width="1423" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/56a89c90-15cf-42ff-9401-3435cdcf299e">
<img width="1424" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/90b24fa1-4d76-4054-b0d6-76d8f2fd6b0b">

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
- NextAuth
- Prisma
- Framer Motion
- Recoil
- TiDB
- MeiliSearch
- Resend

## MeiliSearch エンドポイント

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
