# Kidoku

https://app.rasukarusan.com

![image](https://user-images.githubusercontent.com/17779386/198881209-21a64164-a012-4a36-87eb-bad138d589c4.png)

## 機能

- 本のタイトルから著者、カテゴリ、書影画像を取得
- 読書記録を可視化

## 目的

- スプレッドシートへの記載を楽にする
- ビジュアライズして楽しくする

<img width="957" alt="image" src="https://user-images.githubusercontent.com/17779386/178728788-8395242c-dee1-4338-babd-20d04855ed97.png">

## 技術

- Next.js
- NextAuth
- Prisma
- Mui
- Framer Motion
- Recoil
- TiDB
- MeiliSearch

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
