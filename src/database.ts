import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const dbPath = 'db.json';

const adapter = new FileSync(dbPath);
const database = low(adapter);

/** Write initial, default content, if empty */
const initialDb = {
  urls: [],
};
database.defaults(initialDb).write();

export default database;
