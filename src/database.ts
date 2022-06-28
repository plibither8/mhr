import { Low, JSONFile } from 'lowdb';

/* DB Config */
interface UrlEntry {
  alias: string;
  target: string;
}

interface Schema {
  urls: UrlEntry[]
}

const dbPath = 'db.json';
const adapter = new JSONFile<Schema>(dbPath);
const database = new Low<Schema>(adapter);

async function start() {
  await database.read();
  // Set default data
  database.data ||= { urls: [] };
  database.write();
}
start()

/* API */
/**
 * Get the target corresponding to the alias
 * @param alias - String: Alias of entry
 */
export function get(alias: string): string | undefined {
  const entry = database.data.urls.find(url => url.alias === alias);
  return entry?.target;
}

/**
 * Get all alias-target pairs
 */
export function getAll(): UrlEntry[] {
  const { urls } = database.data;
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

  database.data.urls.push({ alias, target });
  database.write();

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

  const entry = database.data.urls.find(url => url.alias === alias);
  entry.target = target;
  database.write()

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

  const index = database.data.urls.findIndex(url => url.alias === alias);
  database.data.urls.splice(index, 1);
  database.write();

  return true;
}

/**
 * Remove all alias-target pairs
 */
export function removeAll(): void {
  database.data = { urls: [] }
  database.write();
}
