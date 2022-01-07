import { upgradeDB } from './upgradeDB';

export function handleDB(category, logTime, time) {
  let openRequest = indexedDB.open('YouTubeScreenTime', 1),
    db,
    tx,
    store,
    index;

  openRequest.onupgradeneeded = () => {
    console.log('upgrade needed! your version:' + IDBDatabase.version);
    upgradeDB();
  };
  openRequest.onerror = () => {
    console.log('an error has occured');
  };

  openRequest.onsuccess = (e) => {
    db = openRequest.result;
    tx = db.transaction('time_logs', 'readwrite');
    store = tx.objectStore('time_logs');

    index = store.index('date, category');

    db.onerror = (e) => {
      console.log(e.target.error);
    };

    var today = new Date();

    var date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();

    var request = store.index('date, category').getAll([date, category]);

    request.onsuccess = () => {
      if (request.result.length > 0) {
        const timeFromDB = request.result[0].time_in_sec;

        let totalTime = parseInt(timeFromDB) + parseInt(time);

        console.log(timeFromDB);

        if (isNaN(totalTime)) {
          totalTime = 0;
        }

        var obj = {
          id: request.result[0].id,
          category: category,
          date: logTime,
          time_in_sec: totalTime,
        };
        store.put(obj);
      } else {
        var obj = { category: category, date: logTime, time_in_sec: time };
        store.put(obj);
      }
    };
  };
}
