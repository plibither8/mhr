import fetch, { RequestInit } from 'node-fetch';
import config from '../../config.json';

interface TgJsonResponse {
  ok: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
}
type ApiResponse = Promise<TgJsonResponse>;
type RequestMethod = 'GET' | 'POST' | 'DELETE';

function makeRequest(method: RequestMethod, endpoint: string, data: unknown = undefined): ApiResponse {
  const TG_API_BASE = `https://api.telegram.org/bot${config.bot.token}`;
  const requestOptions: RequestInit = { method };
  if (data) {
    requestOptions.body = JSON.stringify(data);
    requestOptions.headers = { 'Content-Type': 'application/json' };
  }
  return fetch(`${TG_API_BASE}/${endpoint}`, requestOptions).then(res => res.json());
}

const api = {
  getMe: (): ApiResponse => makeRequest('GET', 'getMe'),
  getWebhookInfo: (): ApiResponse => makeRequest('GET', 'getWebhookInfo'),
  setWebhook: (data: unknown): ApiResponse => makeRequest('POST', 'setWebhook', data),
  deleteWebhook: (): ApiResponse => makeRequest('POST', 'deleteWebhook'),
  setCommands: (data: unknown): ApiResponse => makeRequest('POST', 'setMyCommands', data),
  sendMessage: (text: string, chatId?: string | number, options: object = {}): ApiResponse =>
    makeRequest('POST', 'sendMessage', {
      text,
      chat_id: chatId || config.bot.chatId,
      parse_mode: 'MarkdownV2',
      reply_markup: { remove_keyboard: true },
      ...options,
    }),
};

export default api;
