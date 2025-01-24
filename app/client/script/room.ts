import dayjs from 'dayjs';
import type {
  MessageType,
  SendMessageJson,
  ReceivedMessageJson,
} from '../../types/index.ts';

const uri = new URL(window.location.href);
const wsProtocol = import.meta.env['VITE_WS_PROTOCOL']
const ws = new WebSocket(
  `${wsProtocol}://${uri.hostname}:${import.meta.env['VITE_PORT']}`
);

let uuid = '';
let channel = '';
let userName = '';

/**
 * メッセージ受信処理
 */
const onMessage = (event: MessageEvent) => {
  const json: ReceivedMessageJson = JSON.parse(event.data);
  if (json?.init === true) {
    uuid = json.uuid;

    sendInitMessage();

    const roomUuidElement = document.querySelector('.room__uuid');
    if (roomUuidElement !== null) roomUuidElement.textContent += uuid;
    return;
  }
  if (json?.type === 'admin_number-in-channel') {
    const channelInChannelSpan: HTMLSpanElement | null = document.querySelector(
      '.room__number-in-channel'
    );
    if (channelInChannelSpan !== null) {
      channelInChannelSpan.textContent = `(${json.message}人)`;
    }
    return;
  }
  const chatDiv = document.getElementById('chat');
  const receivedMessageJson = json;
  if (chatDiv) {
    chatDiv.appendChild(createMessage(receivedMessageJson));
    chatDiv.scrollTo(0, chatDiv.scrollHeight);
  }
  return;
};

/**
 * channelとname情報メッセージを送る
 * 初回コネクト時に実行する
 */
const sendInitMessage = () => {
  const messageJson: SendMessageJson = {
    init: true,
    uuid,
    channel,
    name: userName,
    message: '',
  };
  ws.send(JSON.stringify(messageJson));
};

/**
 * 入力メッセージ送信
 */
const sendMessage = () => {
  const messageInputEl = document.getElementById(
    'messageInput'
  ) as HTMLInputElement | null;
  if (messageInputEl === null) return;
  const messageJson: SendMessageJson = {
    init: false,
    uuid,
    channel,
    name: userName,
    message: messageInputEl.value,
  };
  ws.send(JSON.stringify(messageJson));
  messageInputEl.value = '';
};

/**
 * メッセージを表示するHTML要素を返却
 */
const createMessage = (json: ReceivedMessageJson) => {
  const messageModifier = getMessageModifier(json.type);
  const messageElement = createDiv(`message ${messageModifier}`);
  const messageInnerElement = createDiv('message__inner');
  const textElement = createDiv('message__text');
  const nameElement = createDiv('message__name');
  const timeElement = createDiv('message__time');
  const belowTextElement = createDiv('message__below-text');

  messageElement.appendChild(messageInnerElement);
  messageInnerElement.appendChild(textElement);
  belowTextElement.appendChild(nameElement);
  belowTextElement.appendChild(timeElement);
  messageInnerElement.appendChild(belowTextElement);

  textElement.textContent = json.message;
  nameElement.textContent = json.uuid
    ? `${json.name}(${json.uuid})`
    : json.name;
  timeElement.textContent = dayjs(json.time).format('M/D HH:mm');

  return messageElement;
};

/**
 * messageクラスのモディファイアを返却する
 */
const getMessageModifier = (type: MessageType) => {
  // NOTE: モディファイアクラス名がどこで指定されているのか検索できるように、変数(type)を連結せずに記述している
  switch (type) {
    case 'mine':
      return 'message--mine';
    case 'other':
      return 'message--other';
    case 'info':
      return 'message--info';
    default:
      return '';
  }
};

/**
 * 引数のクラス名を持つdiv要素を生成
 */
const createDiv = (className: string) => {
  const element = document.createElement('div');
  element.className = className;
  return element;
};

/**
 * userNameとチャンネルをsetする。
 * 不正なチャンネルはログインページに戻す
 */
const setUserNameAndChannel = () => {
  const searchParams = new URLSearchParams(window.location.search);
  let tempUserName = searchParams.get('name') || '名無し';
  const tempChannel = searchParams.get('channel') || '-1';
  const tempNumberChannel = Number(tempChannel);

  if (
    tempNumberChannel < 0 ||
    tempNumberChannel > 99999 ||
    Number.isNaN(tempNumberChannel)
  ) {
    window.location.href = '/index.html';
    return;
  }

  if (tempUserName.length > 10) {
    tempUserName = tempUserName.substring(0, 10);
    searchParams.set('name', tempUserName);
    window.location.search = searchParams.toString();
  }

  userName = tempUserName;
  channel = tempChannel;
};

document.addEventListener('DOMContentLoaded', () => {
  setUserNameAndChannel();

  // ヘッダーにチャンネル番号を表示
  const roomChannelElement = document.querySelector('.room__channel');
  if (roomChannelElement !== null) roomChannelElement.textContent += channel;
  // ヘッダーに名前を表示
  const roomNameElement = document.querySelector('.room__name');
  if (roomNameElement !== null) roomNameElement.textContent += userName;

  const roomFormEl: HTMLFormElement | null =
    document.querySelector('.room__footer');
  if (roomFormEl !== null) {
    roomFormEl.addEventListener('submit', () => {
      sendMessage();
    });
  }
});
ws.onmessage = onMessage;
