(function (factory) {
  typeof define === 'function' && define.amd ? define('background', factory) :
  factory();
}((function () { 'use strict';

  function getCurrentDayBound() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    return [date];
  }

  // return days of the current week
  function getCurrentMonthBound() {
    var arrayOfDays = [];
    var curr = new Date(); // get current date

    const daysInMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate(); // returns how many days the current month has

    for (let i = 1; i <= daysInMonth; i++) {
      var tempDate = new Date(curr.setDate(i));
      var dateDateFormated = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
      arrayOfDays.push(dateDateFormated);
    }

    return arrayOfDays;
  }

  // return days of the current week
  function getCurrentWeekBound() {
    var arrayOfDays = [];
    var curr = new Date(); // get current date

    const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week

    for (let i = 0; i <= 6; i++) {
      var tempDay = first + i;
      var tempDate = new Date(curr.setDate(tempDay));
      var dateDateFormated = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
      arrayOfDays.push(dateDateFormated);
    }

    return arrayOfDays;
  }

  function prepareDateObject(dateBound) {
    const object = {};
    dateBound.forEach(singleDate => {
      object[singleDate] = {};
    });
    return object;
  }

  function upgradeDB(openRequest) {
    db = openRequest.result; // create time_log table

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
    }); // create restrictions table

    store = db.createObjectStore('restrictions', {
      keyPath: 'id',
      autoIncrement: true
    });
    index = store.createIndex('category', ['category'], {
      unique: true
    });
  }

  function queryDB(tableName, tableIndex, callback) {
    let openRequest = indexedDB.open('YouTubeScreenTime', 1),
        db,
        tx,
        store,
        index;

    openRequest.onupgradeneeded = () => {
      console.log('upgrade needed! your version:' + IDBDatabase.version);
      upgradeDB();
    };

    openRequest.onerror = e => {
      console.error(e.target.error);
    };

    openRequest.onsuccess = e => {
      db = openRequest.result;
      tx = db.transaction(tableName, 'readwrite');
      store = tx.objectStore(tableName);
      index = store.index(tableIndex);

      db.onerror = e => {
        console.error(e.target.error);
      };

      callback(store);
    };
  }

  function getAllWatched(period, callback) {
    queryDB('time_logs', 'date, category', store => {
      // check what period was requested
      var bound = [];

      if (period === 'day') {
        bound = getCurrentDayBound();
      } else if (period === 'week') {
        bound = getCurrentWeekBound();
      } else if (period === 'month') {
        bound = getCurrentMonthBound();
      } else {
        return console.error('invalid period given, valid period values include: day, week, month');
      }

      var request = store.index('date').getAll();

      request.onsuccess = () => {
        if (request.result.length > 0) {
          var total = 0;
          var categoryObject = {};
          var dateObject = prepareDateObject(bound);
          request.result.forEach(elem => {
            if (bound.includes(elem.date)) {
              // insert data into category object
              if (elem.category in categoryObject) {
                // if the category already is in array
                categoryObject[elem.category] = categoryObject[elem.category] + elem.time_in_sec;
              } else {
                // if the category is not in array already
                categoryObject[elem.category] = elem.time_in_sec;
              } // insert data into date object


              if (elem.category in dateObject[elem.date]) {
                dateObject[elem.date][elem.category] = dateObject[elem.date][elem.category] + elem.time_in_sec;
              } else {
                dateObject[elem.date][elem.category] = elem.time_in_sec;
              }

              total += elem.time_in_sec;
            }
          });
          const data = {
            totalTime: total,
            categoryObject: categoryObject,
            dateObject: dateObject
          };
          callback(data);
        }
      };
    });
  }

  function handleDB(category, logTime, time) {
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

  console.log('bg'); // handle listening for messages

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
    console.log(request); // save time from content

    if (request.type === 'saveRequest') {
      // adds new entry to watch time log
      handleDB(request.body.category, request.body.date, request.body.time);
    } else if (request.type === 'dataRequest') {
      // watch time data request from popup
      if (request.body.period === 'day') {
        getAllWatched('day', res => {
          sendResponse({
            status: 200,
            data: {
              time: res.totalTime,
              categoryObject: res.categoryObject,
              dateObject: res.dateObject
            }
          });
        });
      } else if (request.body.period === 'week') {
        getAllWatched('week', res => {
          sendResponse({
            status: 200,
            data: {
              time: res.totalTime,
              categoryObject: res.categoryObject,
              dateObject: res.dateObject
            }
          });
        });
      } else if (request.body.period === 'month') {
        getAllWatched('month', res => {
          sendResponse({
            status: 200,
            data: {
              time: res.totalTime,
              categoryObject: res.categoryObject,
              dateObject: res.dateObject
            }
          });
        });
      } else {
        sendResponse({
          status: 404,
          error: `period invalid or not given: ${request.body.period}`
        });
      }
    } else if (request.type === 'saveRestriction') {
      console.log('restriction save requested');
    } else if (request.type === 'getRestriction') {
      console.log('restriction requested');
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
