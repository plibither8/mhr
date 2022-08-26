import { Hono } from 'hono';
import config from '../config';
import { initialiseBot, webhookHandler } from './bot/index';
import { getAlias, prefix } from './bot/utils';
import env, { setNamepace } from './kv';

export interface Env {
  MHR: KVNamespace;
}

const app = new Hono<Env>();

app.use(async ctx => setNamepace('MHR', ctx.env.MHR));

// Initialise bot
app.get(`${config.bot.webhookPath}/${config.bot.token}/initialise`, async ctx => {
  await initialiseBot();
  return ctx.text('Bot initialized');
});

// Handle Telegram webhook requests
app.post(`${config.bot.webhookPath}/${config.bot.token}`, webhookHandler);

// Handle URL shortener redirects
app.get('*', async ctx => {
  const { pathname } = new URL(ctx.req.url);
  const alias = getAlias(pathname);
  const target = await env.MHR.get(prefix(alias, 'alias'));
  if (target) return Response.redirect(target);
});

// All other GETs
app.get('*', async ctx => ctx.redirect(config.fallbackUrl));

export default app;
