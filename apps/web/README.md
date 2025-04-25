# kidoku

https://kidoku.net/

<img width="1247" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/d2b88d99-670b-468e-8fd3-27f6ecb50430">
<img width="1059" alt="image" src="https://github.com/Rasukarusan/kidoku/assets/17779386/52735f61-825a-44ed-88dd-12a6153a7eca">

## 機能

- AIによる読書傾向分析
- 本の検索(バーコードスキャン、タイトル検索、ユーザー本棚検索)
- 2022年、2023年などシートごとの本の管理
- 月ごとの冊数、カテゴリ内訳、本の感想

## 技術

- Next.js
- Tailwind
- NextAuth
- Prisma
- Framer Motion
- Jotai
- TiDB
- MeiliSearch
- Resend
- Pusher

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
# 初回はモーダルに.envに記載のMEILI_MASTER_KEYを入力
open http://localhost:7700

# meilisearchにドキュメント登録
curl -XPOST -H "Authorization: Bearer ${ADMIN_AUTH_TOKEN}" http://localhost:3000/api/batch/meilisearch
# {"result":true}
```

## MeiliSearchの起動に失敗した場合

`dockuer-compose up`で下記エラーが出た場合、`data/meilisearch`の`meilisearch`ディレクトリを削除してから再度`docker-compose up`すると起動できます。

```
Error: Meilisearch (v1.4.2) failed to infer the version of the database.
To update Meilisearch please follow our guide on https://www.meilisearch.com/docs/learn/update_and_migration/updating.
```
