import { upgradeDB } from './upgradeDB';

export function queryDB(tableName, tableIndex, callback) {
  let openRequest = indexedDB.open('YouTubeScreenTime', 1),
    db,
    tx,
    store,
    index;

  openRequest.onupgradeneeded = () => {
    console.log('upgrade needed! your version:' + IDBDatabase.version);
    upgradeDB(openRequest, store, index);
  };
  openRequest.onerror = (e) => {
    return console.error(tableName, e.target.error);
  };

  openRequest.onsuccess = (e) => {
    db = openRequest.result;
    tx = db.transaction(tableName, 'readwrite');
    store = tx.objectStore(tableName);

    index = store.index(tableIndex);

    db.onerror = (e) => {
      return console.error(tableName, e.target.error);
    };
    callback(store);
  };
}
