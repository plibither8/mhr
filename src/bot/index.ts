import { Handler } from 'hono';
import { Env } from '../server';
import api from './api';
import { commands } from './commands';
import messages from './messages';
import { messageHandler } from './states';
import { createWebhookUrl, isAuthorized, isBotInitialised } from './utils';

export async function initialiseBot(forceReinit = false) {
  const initisationStatus = await isBotInitialised();
  if (initisationStatus && !forceReinit) return;

  console.log('Initialising bot...');
  await Promise.all([
    api.setWebhook({ url: createWebhookUrl() }),
    api.setCommands({ commands }),
    api.sendMessage(messages.common.reinitialisedBot(), undefined, { disable_web_page_preview: true }),
  ]);
  console.log('Bot initialised!');
}

export const webhookHandler: Handler<string, Env> = async ctx => {
  const { message } = await ctx.req.json();
  if (message) {
    const { from, text, entities = [] } = message;
    if (await isAuthorized(from, text)) {
      await messageHandler({ text, entities });
    }
  }
  return ctx.text('Success');
};
