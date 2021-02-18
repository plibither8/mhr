import * as db from '../database';
import config from '../../config.json';
import { commands } from './commands';
import api from './api';
import { stateSwitcher } from './states';
import { createWebhookUrl, isBotInitialised, isAuthorized } from './utils';

async function initialiseBot() {
  const initisationStatus = await isBotInitialised();
  if (initisationStatus) return;

  console.log('Initialising bot...');

  // Set webhook
  const webhookUrl = createWebhookUrl();
  await api.setWebhook({ url: webhookUrl });

  // Set commands
  await api.setCommands({ commands });

  console.log('Bot initialised!');
}

async function webhookHandler(req, res): Promise<void> {
  const { message } = req.body;
  const { from, text, entities = [] } = message;
  if (isAuthorized(from?.id)) {
    stateSwitcher({ text, entities });
  }
  res.end();
}

async function main() {
  // await api.deleteWebhook();
  await initialiseBot();
}

main();

export default webhookHandler;
