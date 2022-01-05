import { getCurrentMonthBound } from '../helpers/getCurrentMonthBound';
import { getCurrentWeekBound } from '../helpers/getCurrentWeekBound';
import { prepareDateObject } from '../helpers/prepareDateObject';

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
      bound = getCurrentMonthBound();
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
        var dateObject = prepareDateObject(bound);
        request.result.forEach((elem) => {
          if (bound.includes(elem.date)) {
            // insert data into category object
            if (elem.category in categoryObject) {
              // if the category already is in array
              categoryObject[elem.category] =
                categoryObject[elem.category] + elem.time_in_sec;
            } else {
              // if the category is not in array already
              categoryObject[elem.category] = elem.time_in_sec;
            }

            // insert data into date object
            if (elem.category in dateObject[elem.date]) {
              dateObject[elem.date][elem.category] =
                dateObject[elem.date][elem.category] + elem.time_in_sec;
            } else {
              dateObject[elem.date][elem.category] = elem.time_in_sec;
            }
            total += elem.time_in_sec;
          }
        });

        const sortable = Object.fromEntries(
          Object.entries(categoryObject).sort(([, a], [, b]) => b - a)
        );

        const data = {
          totalTime: total,
          categoryObject: categoryObject,
          dateObject: dateObject,
        };

        cb(data);
      }
    };
  };
}
