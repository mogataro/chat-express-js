# チャット

## 初回に実行

`docker compose run --rm setup`

## コンテナ起動

`docker compose up app -d`

## build

- 本番: `docker compose exec app npm run build`
- local: `docker compose exec app npm run build-dev`

## 画面の表示

- 本番: `docker compose exec app npm run serve`
- local: `docker compose exec app npm run serve-dev`

<http://localhost> にアクセス
