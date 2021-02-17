import database from './database';

export function getTarget(alias: string): string {
  const [entry] = database
    .get('urls')
    .filter({ alias })
    .value();
  return entry?.target;
}
