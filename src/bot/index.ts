import api from './api';
import { commands } from './commands';
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

  console.log('Bot initialised!');
}

async function main() {
  await initialiseBot();
}

main();

export default async function webhookHandler(req, res): Promise<void> {
  const { message } = req.body;
  const { from, text, entities = [] } = message;
  if (isAuthorized(from?.id)) {
    messageHandler({ text, entities });
  }
  res.end();
}
