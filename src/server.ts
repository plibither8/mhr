import polka from 'polka';
import redirect from '@polka/redirect';
import { getTarget } from './utils';
import config from '../config.json';

const handlers = {
  /**
   * Redirect to the alias' target, if found
   */
  aliasRedirection: (req, res, next) => {
    const { alias } = req.params;
    const target = getTarget(alias);
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
  .get('/:alias', handlers.aliasRedirection)
  .get('*', handlers.fallbackRedirection)
  .listen(3000, () => console.log('running on port 3000'));
