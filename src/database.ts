import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

/* DB Config */
interface UrlEntry {
  alias: string;
  target: string;
}

const dbPath = 'db.json';
const adapter = new FileSync(dbPath);
const database = low(adapter);

// Write initial, default content, if empty
const initialDb = {
  urls: [],
};
database.defaults(initialDb).write();

/* API */
/**
 * Get the target corresponding to the alias
 * @param alias - String: Alias of entry
 */
export function get(alias: string): string | undefined {
  const [entry] = database
    .get('urls')
    .filter({ alias })
    .value();
  return entry?.target;
}

/**
 * Get all alias-target pairs
 */
export function getAll(): UrlEntry[] {
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
export function set(alias: string, target: string): boolean {
  if (get(alias)) {
    // error here!
    return false;
  }

  database
    .get('urls')
    .push({ alias, target })
    .write();

  return true;
}

/**
 * Update an alias with a new target
 * @param alias String
 * @param target String
 */
export function update(alias: string, target: string): boolean {
  if (!get(alias)) {
    // error here!
    return false;
  }

  database
    .get('urls')
    .find({ alias })
    .assign({ target })
    .write();

  return true;
}

/**
 * Remove an alias-target pair
 * @param alias String
 */
export function remove(alias: string): boolean {
  if (!get(alias)) {
    // error here!
    return false;
  }

  database
    .get('urls')
    .remove({ alias })
    .write();

  return true;
}

/**
 * Remove all alias-target pairs
 */
export function removeAll(): void {
  database
    .set('urls', [])
    .write();
}
