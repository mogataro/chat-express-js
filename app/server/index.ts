import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Request, type Response } from 'express';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

import './websocket.js';

const PORT = process.env['VITE_PORT'];
const routers = [
  { name: 'login', path: '/' },
  { name: 'room', path: '/room' },
];

routers.forEach((router) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(path.dirname(__filename)); // serverディレクトリの親ディレクトリのpath

  app.use(router.path, express.static(__dirname + '/client'));

  app.get(router.path, (request: Request, response: Response) => {
    response
      .status(200)
      .sendFile(__dirname + `/client/html/${router.name}.html`);
  });
});

app
  .listen(PORT, () => {
    console.log('Server running at PORT: ', PORT);
  })
  .on('error', (error) => {
    // エラーの処理
    throw new Error(error.message);
  });
