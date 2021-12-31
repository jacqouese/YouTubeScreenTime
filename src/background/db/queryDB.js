import { getCurrentWeekBound } from '../helpers/getCurrentWeekBound';

export async function queryDB(period, cb) {
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
      console.error(e.target.error);
    };

    var today = new Date();

    var date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();

    var bound = [];

    // check what period was requested
    if (period === 'day') {
      bound = [date];
    } else if (period === 'week') {
      bound = getCurrentWeekBound();
    } else if (period === 'month') {
      bound = [date];
    } else {
      return console.error(
        'invalid period given, valid period values include: day, week, month'
      );
    }

    var request = store.index('date').getAll();

    request.onsuccess = () => {
      if (request.result.length > 0) {
        var total = 0;
        var categoryObject = {};
        request.result.forEach((elem) => {
          if (bound.includes(elem.date)) {
            if (elem.category in categoryObject) {
              categoryObject[elem.category] =
                categoryObject[elem.category] + elem.time_in_sec;
            } else {
              categoryObject[elem.category] = elem.time_in_sec;
            }
            total += elem.time_in_sec;
          }
        });

        const data = { totalTime: total, categoryObject: categoryObject };
        cb(data);
      }
    };
  };
}
