export function upgradeDB(openRequest) {
  db = openRequest.result;

  // create time_log table
  store = db.createObjectStore('time_logs', {
    keyPath: 'id',
    autoIncrement: true,
  });
  index = store.createIndex('date', ['date'], {
    unique: false,
  });
  index = store.createIndex('category', ['category'], {
    unique: false,
  });
  index = store.createIndex('date, category', ['date', 'category'], {
    unique: false,
  });

  // create restrictions table
  store = db.createObjectStore('restrictions', {
    keyPath: 'id',
    autoIncrement: true,
  });
  index = store.createIndex('category', ['category'], {
    unique: true,
  });
}
