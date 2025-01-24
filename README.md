# チャット

## 初回に実行

`docker compose run --rm setup`

## コンテナ起動

`docker compose up app -d`

## build

### 1) client のビルド

- 本番: `docker compose exec app npm run build-client`
- local: `docker compose exec app npm run build-client-dev`

### 2) server のビルド

`docker compose exec app npm run build-server`

## 画面の表示

`docker compose exec app npm run start`

<http://localhost> にアクセス
