(function (factory) {
  typeof define === 'function' && define.amd ? define('background', factory) :
  factory();
}((function () { 'use strict';

  function handleDB(category, logTime, time) {
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
        autoIncrement: true
      });
      index = store.createIndex('date', ['date'], {
        unique: false
      });
      index = store.createIndex('category', ['category'], {
        unique: false
      });
      index = store.createIndex('date, category', ['date', 'category'], {
        unique: false
      });
    };

    openRequest.onerror = () => {
      console.log('an error has occured');
    };

    openRequest.onsuccess = e => {
      db = openRequest.result;
      tx = db.transaction('time_logs', 'readwrite');
      store = tx.objectStore('time_logs');
      index = store.index('date, category');

      db.onerror = e => {
        console.log(e.target.error);
      };

      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
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
            time_in_sec: totalTime
          };
          store.put(obj);
        } else {
          var obj = {
            category: category,
            date: logTime,
            time_in_sec: time
          };
          store.put(obj);
        }
      };
    };
  }

  // return days of the current week
  function getCurrentWeekBound() {
    var arrayOfDays = [];
    var curr = new Date(); // get current date

    const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week

    for (let i = 0; i <= 6; i++) {
      var tempDay = first + i;
      var tempDayISO = new Date(curr.setDate(tempDay)).toISOString().split('T')[0];
      arrayOfDays.push(tempDayISO);
    }

    return arrayOfDays;
  }

  async function queryDB(period, cb) {
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
        autoIncrement: true
      });
      index = store.createIndex('date', ['date'], {
        unique: false
      });
      index = store.createIndex('category', ['category'], {
        unique: false
      });
      index = store.createIndex('date, category', ['date', 'category'], {
        unique: false
      });
    };

    openRequest.onerror = () => {
      console.log('an error has occured');
    };

    openRequest.onsuccess = e => {
      db = openRequest.result;
      tx = db.transaction('time_logs', 'readwrite');
      store = tx.objectStore('time_logs');
      index = store.index('date, category');

      db.onerror = e => {
        console.error(e.target.error);
      };

      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var bound = []; // check what period was requested

      if (period === 'day') {
        bound = [date];
      } else if (period === 'week') {
        bound = getCurrentWeekBound();
      } else if (period === 'month') {
        bound = [date];
      } else {
        return console.error('invalid period given, valid period values include: day, week, month');
      }

      var request = store.index('date').getAll();

      request.onsuccess = () => {
        if (request.result.length > 0) {
          var total = 0;
          var categoryObject = {};
          request.result.forEach(elem => {
            if (bound.includes(elem.date)) {
              if (elem.category in categoryObject) {
                categoryObject[elem.category] = categoryObject[elem.category] + elem.time_in_sec;
              } else {
                categoryObject[elem.category] = elem.time_in_sec;
              }

              total += elem.time_in_sec;
            }
          });
          const data = {
            totalTime: total,
            categoryObject: categoryObject
          };
          cb(data);
        }
      };
    };
  }

  console.log('bg'); // handle listening for messages

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
    console.log(request); // save time from content

    if (request.type === 'saveRequest') {
      handleDB(request.body.category, request.body.date, request.body.time);
    } else if (request.type === 'dataRequest') {
      // data request from popup
      if (request.body.period === 'day') {
        queryDB('day', res => {
          sendResponse({
            status: 200,
            data: {
              time: res.totalTime,
              categoryObject: res.categoryObject
            }
          });
        });
      } else if (request.body.period === 'week') {
        queryDB('week', res => {
          sendResponse({
            status: 200,
            data: {
              time: res.totalTime,
              categoryObject: res.categoryObject
            }
          });
        });
      } else if (request.body.period === 'month') {
        console.log('month requested');
        sendResponse({
          status: 200
        });
      } else {
        sendResponse({
          status: 404,
          error: `period invalid or not given: ${request.body.period}`
        });
      }
    } else {
      sendResponse({
        status: 404,
        error: `request type invalid: "${request.type}"`
      });
    }

    return true; // prevent closed connection error
  });
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.status == 'complete') {
      console.log('Tab updated: ');
      chrome.tabs.sendMessage(tabId, {
        data: 'new url'
      });
    }
  });

})));
