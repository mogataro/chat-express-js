import { WebSocketServer, WebSocket } from 'ws';
import dayjs from 'dayjs';
import xss from 'xss';
import dotenv from 'dotenv';
dotenv.config();
const wss = new WebSocketServer({ noServer: true });
const clients = {};
// WebSocket接続, ws が接続したクライアント
wss.on('connection', (ws) => {
    // クライアント識別子(ID)
    const uuid = getRandomId();
    // 既に同じuuidを持つユーザがいた場合
    if (Object.keys(clients).some((clientId) => clientId === uuid)) {
        sendFailedGetIdMessage(ws);
        return;
    }
    // clientsにclientプロパティ追加
    clients[uuid] = {
        ws: null,
        channel: '',
        name: '',
    };
    clients[uuid].ws = ws; // clientにwsプロパティ追加
    sendInitMessage(uuid);
    // メッセージ受信処理
    ws.on('message', (data) => {
        const json = JSON.parse(data);
        json.name =
            typeof json?.name === 'string' ? json.name.substring(0, 10) : '名無し';
        json.channel = json?.channel ? xss(json.channel) : '';
        json.uuid = json?.uuid ? xss(json.uuid) : '';
        // 初回コネクト時にクライアントから送られるメッセージの場合
        if (json?.init === true && json.channel && json.uuid) {
            clients[json.uuid].name = json.name; // clientにnameプロパティ追加
            clients[json.uuid].channel = json.channel; // clientにchannelプロパティ追加
            sendLoginOrLogoutMessage(uuid, 'login');
            sendNumberInChannelAdminMessage(json.channel, 'login');
            return;
        }
        // 同じチャンネルにいるユーザにメッセージ送信
        if (!!json.channel && typeof json?.message === 'string') {
            sendMessageToChannel(json, ws);
        }
    });
    ws.on('close', () => {
        sendLoginOrLogoutMessage(uuid, 'logout');
        sendNumberInChannelAdminMessage(clients[uuid].channel, 'logout');
        delete clients[uuid];
    });
});
/**
 * 接続ユーザに対して、ID取得失敗メッセージを送信
 */
const sendFailedGetIdMessage = (ws) => {
    const messageJson = {
        init: false,
        uuid: '',
        channel: '',
        name: 'システム通知',
        message: 'IDの取得に失敗しました。ページを更新して下さい。',
        type: 'info',
        time: dayjs(),
    };
    ws.send(JSON.stringify(messageJson));
};
/**
 * 接続ユーザに対してuuidを送る
 */
const sendInitMessage = (uuid) => {
    if (clients[uuid].ws === null)
        return;
    const initSendMessageJson = {
        init: true,
        uuid,
        channel: '',
        name: '',
        message: '',
        type: 'info',
        time: null,
    };
    clients[uuid].ws.send(JSON.stringify(initSendMessageJson));
};
/**
 * 入室/退室メッセージを送信
 */
const sendLoginOrLogoutMessage = (uuid, mode) => {
    const clientsInChannel = getClientsInChannel(clients[uuid].channel);
    const doing = mode === 'login' ? '入室' : '退室';
    clientsInChannel.forEach((client) => {
        if (client === null || client.readyState !== WebSocket.OPEN)
            return;
        const sendMessageJson = {
            init: false,
            uuid: '',
            channel: '',
            name: 'システム通知',
            message: `${clients[uuid].name}さん(${uuid})が${doing}しました！`,
            type: 'info',
            time: dayjs(),
        };
        client.send(JSON.stringify(sendMessageJson));
    });
};
/**
 * 引数のチャンネルにいるユーザーに受信したメッセージを送信
 */
const sendMessageToChannel = (receivedMessageJson, ws) => {
    const clientsInChannel = getClientsInChannel(receivedMessageJson.channel);
    clientsInChannel.forEach((client) => {
        if (client === null || client.readyState !== WebSocket.OPEN)
            return;
        const sendMessageJson = {
            ...receivedMessageJson,
            init: false,
            name: receivedMessageJson.name.substring(0, 10),
            type: ws === client ? 'mine' : 'other',
            time: dayjs(),
        };
        client.send(JSON.stringify(sendMessageJson));
    });
};
/**
 * チャンネルにいる人数を管理メッセージで送信
 */
const sendNumberInChannelAdminMessage = (channel, mode) => {
    const clientsInChannel = getClientsInChannel(channel);
    const numberInChannel = mode === 'login'
        ? String(clientsInChannel.length)
        : String(clientsInChannel.length - 1);
    clientsInChannel.forEach((client) => {
        if (client === null || client.readyState !== WebSocket.OPEN)
            return;
        const sendMessageJson = {
            init: false,
            uuid: '',
            channel: '',
            name: '',
            message: numberInChannel,
            type: 'admin_number-in-channel',
            time: null,
        };
        client.send(JSON.stringify(sendMessageJson));
    });
};
/**
 * チャンネルにいるクライアントのuuid配列
 */
const getClientsInChannel = (channel) => {
    if (!channel) {
        return [];
    }
    return Object.entries(clients)
        .filter((clientArray) => {
        if (!clientArray[1] || !clientArray[1]?.channel)
            return false;
        return clientArray[1].channel === channel;
    })
        .map((clientArray) => clientArray[1].ws);
};
/**
 * 10文字のランダム文字列IDを返却
 */
const getRandomId = () => {
    const strings = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(Array(10))
        .map(() => strings[Math.floor(Math.random() * strings.length)])
        .join('');
};
export default wss;
