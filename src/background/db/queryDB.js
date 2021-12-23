export async function queryDB(cb) {
  let openRequest = indexedDB.open('YouTubeScreenTime', 1),
    db,
    tx,
    store,
    index;

  openRequest.onupgradeneeded = () => {
    console.log('upgrade needed! your version:' + IDBDatabase.version);

    db = openRequest.result;
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

    var request = store.index('date').getAll([date]);

    request.onsuccess = () => {
      if (request.result.length > 0) {
        console.log(request.result);
        var total = 0;
        request.result.forEach((elem) => {
          total += elem.time_in_sec;
        });
        cb(total);
      }
    };
  };
}
