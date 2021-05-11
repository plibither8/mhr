import polka from 'polka';
import redirect from '@polka/redirect';
import { json } from 'body-parser';
import * as db from './database';
import bot from './bot';
import config from '../config.json';
import messages from './bot/messages';
import api from './bot/api';

function getAlias(path: string): string {
  let newPath = path.slice(1);
  if (newPath[newPath.length - 1] === '/') newPath = newPath.slice(0, -1);
  return newPath;
}

async function notify(req, alias: string, target: string) {
  const ip: string = req.headers['x-forwarded-for'];
  const [message, options] = await messages.common.redirectNotify(ip, alias, target);
  api.sendMessage(message, undefined, options);
}

const handlers = {
  /**
   * The bot handler
   */
  bot,

  /**
   * Redirect to the alias' target, if found
   */
  aliasRedirection: async (req, res, next) => {
    const alias = getAlias(req.path);
    const target = db.get(alias);
    if (target) {
      redirect(res, target);
      notify(req, alias, target);
      return;
    }
    next();
  },

  /**
   * Else, redirect to the fallback url specified in the config
   */
  fallbackRedirection: (req, res) => {
    redirect(res, config.fallbackUrl);
  },
};

polka()
  .use(json())
  .post(`${config.bot.webhookPath}/${config.bot.token}`, handlers.bot)
  .get('*', handlers.aliasRedirection)
  .get('*', handlers.fallbackRedirection)
  .listen(3000, () => console.log('running on port 3000'));
