import polka from 'polka';
import redirect from '@polka/redirect';
import { json } from 'body-parser';
import * as db from './database';
import bot from './bot';
import config from '../config.json';

const handlers = {
  /**
   * The bot handler
   */
  bot,

  /**
   * Redirect to the alias' target, if found
   */
  aliasRedirection: (req, res, next) => {
    const { alias } = req.params;
    const target = db.get(alias);
    if (target) {
      redirect(res, target);
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
  .get('/:alias', handlers.aliasRedirection)
  .get('*', handlers.fallbackRedirection)
  .listen(3000, () => console.log('running on port 3000'));
