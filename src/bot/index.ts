import api from './api';
import { commands } from './commands';
import messages from './messages';
import { messageHandler } from './states';
import { createWebhookUrl, isBotInitialised, isAuthorized } from './utils';

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

export const webhookHandler = async (request: Request) => {
  const { message } = await request.json();
  if (message) {
    const { from, text, entities = [] } = message;
    if (await isAuthorized(from, text)) {
      await messageHandler({ text, entities });
    }
  }
  return new Response('Success');
};
