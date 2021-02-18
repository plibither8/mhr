import api from './api';
import * as db from '../database';
import config from '../../config.json';
import { ALIAS_REGEX } from './constants';

export interface MessageEntity {
  offset: number;
  length: number;
  type: string;
}

export function createWebhookUrl(): string {
  return `${config.domain}${config.bot.webhookPath}/${config.bot.token}`;
}

export async function isBotInitialised(): Promise<boolean> {
  const {
    result: { url },
  } = await api.getWebhookInfo();
  return Boolean(url === createWebhookUrl());
}

export async function isAuthorized(id: number): Promise<boolean> {
  if (id !== Number(config.bot.chatId)) {
    await api.sendMessage('You are unauthorized to interact with this bot.', id);
    return false;
  }
  return true;
}

export function getCommandFromText(text: string, entities: MessageEntity[]): string | undefined {
  const [entity] = entities;
  return entity && entity.type === 'bot_command' ? text.substr(entity.offset + 1, entity.length - 1) : undefined;
}

export function isValidAlias(alias: string): boolean {
  return ALIAS_REGEX.test(alias);
}

export function isValidUrl(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export function chunkify(array: string[], size: number): string[][] {
  return Array(Math.ceil(array.length / size))
    .fill(undefined)
    .map((_, index) => index * size)
    .map(begin => array.slice(begin, begin + size));
}
