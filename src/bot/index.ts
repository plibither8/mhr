import api from './api';
import { commands } from './commands';
import messages from './messages';
import { messageHandler } from './states';
import { createWebhookUrl, isBotInitialised, isAuthorized } from './utils';

async function initialiseBot(forceReinit = false) {
  const initisationStatus = await isBotInitialised();
  if (initisationStatus && !forceReinit) return;

  console.log('Initialising bot...');

  // Set webhook
  const webhookUrl = createWebhookUrl();
  await api.setWebhook({ url: webhookUrl });

  // Set commands
  await api.setCommands({ commands });
  await api.sendMessage(messages.common.reinitialisedBot(), undefined, { disable_web_page_preview: true });

  console.log('Bot initialised!');
}

initialiseBot();

export default async function webhookHandler(req, res): Promise<void> {
  const { message } = req.body;
  if (message) {
    const { from, text, entities = [] } = message;
    if (await isAuthorized(from, text)) {
      messageHandler({ text, entities });
    }
  }
  res.end();
}
