import { upgradeDB } from './upgradeDB';

export function queryDB(tableName, tableIndex, callback) {
  let openRequest = indexedDB.open('YouTubeScreenTime', 1),
    db,
    tx,
    store,
    index;

  openRequest.onupgradeneeded = () => {
    console.log('upgrade needed! your version:' + IDBDatabase.version);
    upgradeDB();
  };
  openRequest.onerror = (e) => {
    console.error(e.target.error);
  };

  openRequest.onsuccess = (e) => {
    db = openRequest.result;
    tx = db.transaction(tableName, 'readwrite');
    store = tx.objectStore(tableName);

    index = store.index(tableIndex);

    db.onerror = (e) => {
      console.error(e.target.error);
    };

    callback(store);
  };
}
