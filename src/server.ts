import polka from 'polka';
import redirect from '@polka/redirect';
import database from './database';
import config from '../config.json';

function getTarget(alias: string): string {
  const [entry] = database
    .get('urls')
    .filter({ alias })
    .value();
  return entry?.target;
}

function aliasRedirection(req, res, next) {
  const { alias } = req.params;
  const target = getTarget(alias);
  if (target) {
    redirect(res, target);
    return;
  }
  next();
}

function fallbackRedirection(req, res) {
  redirect(res, config.fallbackUrl);
}

polka()
  .get('/:alias', aliasRedirection)
  .get('*', fallbackRedirection)
  .listen(3000, () => console.log('running on port 3000'));
