import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

/* DB Config */
const dbPath = 'db.json';

const adapter = new FileSync(dbPath);
const database = low(adapter);

/** Write initial, default content, if empty */
const initialDb = {
  urls: [],
};
database.defaults(initialDb).write();

/* API */
/**
 * Get the target corresponding to the alias
 * @param alias - String: Alias of entry
 */
export function get(alias: string): string {
  const [entry] = database
    .get('urls')
    .filter({ alias })
    .value();
  return entry?.target;
}

/**
 * Get all alias-target pairs
 */
export function getAll() {
  const urls = database
    .get('urls')
    .value();
  return urls;
}

/**
 * Set an alias-target pair in the url's list
 * @param alias String
 * @param target String
 */
export function set(alias: string, target: string) {

}

export function update(alias: string, target: string) {

}

export function remove(alias: string) {

}

export function removeAll() {

}
