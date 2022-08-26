import { Hono } from 'hono';
import config from '../config';
import { initialiseBot, webhookHandler } from './bot/index';
import { getAlias, prefix } from './bot/utils';
import { setNamepace } from './kv';

export interface Env {
  MHR: KVNamespace;
}

const app = new Hono<Env>();

app.use(async (ctx, next) => {
  setNamepace('MHR', ctx.env.MHR);
  await next();
});

// Initialise bot
app.get(`${config.bot.webhookPath}/${config.bot.token}/initialise`, async ctx => {
  await initialiseBot();
  return ctx.text('Bot initialized');
});

// Handle Telegram webhook requests
app.post(`${config.bot.webhookPath}/${config.bot.token}`, webhookHandler);

// Handle URL shortener redirects
app.get('*', async (ctx, next) => {
  const { pathname } = new URL(ctx.req.url);
  const alias = getAlias(pathname);
  const target = await ctx.env.MHR.get(prefix(alias, 'alias'));
  if (target) return ctx.redirect(target);
  await next();
});

// All other GETs
app.get('*', ctx => ctx.redirect(config.fallbackUrl));

export default app;
