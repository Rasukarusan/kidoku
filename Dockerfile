FROM getmeili/meilisearch:prototype-japanese-6
# DockerHubにpushするとき用
# FROM --platform=linux/amd64 getmeili/meilisearch:prototype-japanese-6

# デプロイ先のVMのメモリ不足でmeilisearchのエンドポイントによるインデックス登録などができないため、予めデータをコピーしておく
COPY data/meilisearch /meili_data/data.ms
