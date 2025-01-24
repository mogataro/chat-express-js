# チャット

## 初回に実行

`docker compose run --rm setup`

## コンテナ起動

`docker compose up app -d`

## build

`docker compose exec app npm run build-client`
`docker compose exec app npm run build-server`

## 画面の表示

`docker compose exec app npm run start`

<http://localhost:{PORT}> にアクセス
