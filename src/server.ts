import { Router } from 'itty-router';

import config from '../config';
import { initialiseBot, webhookHandler } from './bot/index';
import { getAlias, prefix } from './bot/utils';
import env, { setNamepace } from './kv';

interface Env {
  MHR: KVNamespace;
}

const router = Router();

// Initialise bot
router.get(`${config.bot.webhookPath}/${config.bot.token}/initialise`, initialiseBot);

// Handle Telegram webhook requests
router.post(`${config.bot.webhookPath}/${config.bot.token}`, webhookHandler);

// Handle URL shortener redirects
router.get('*', async request => {
  const { pathname } = new URL(request.url);
  const alias = getAlias(pathname);
  const target = await env.MHR.get(prefix(alias, 'alias'));
  if (target) return Response.redirect(target);
});

// All other GETs
router.get('*', async () => {
  return Response.redirect(config.fallbackUrl);
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    setNamepace('MHR', env.MHR);
    return router.handle(request, env);
  },
};
