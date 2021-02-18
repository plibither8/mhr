import api from './api';
import config from '../../config.json';

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
