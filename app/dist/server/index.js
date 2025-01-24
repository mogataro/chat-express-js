import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
import { wss } from './websocket.js';
const PORT = process.env['VITE_PORT'];
const routers = [
    { name: 'login', path: '/' },
    { name: 'room', path: '/room' },
];
routers.forEach((router) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(path.dirname(__filename)); // serverディレクトリの親ディレクトリのpath
    app.use(router.path, express.static(__dirname + '/client'));
    app.get(router.path, (request, response) => {
        response
            .status(200)
            .sendFile(__dirname + `/client/html/${router.name}.html`);
    });
});
const httpServer = app.listen(PORT);
httpServer.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});
