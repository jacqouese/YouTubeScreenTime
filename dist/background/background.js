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

  async function queryDB(cb) {
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
      var request = store.index('date').getAll([date]);

      request.onsuccess = () => {
        if (request.result.length > 0) {
          console.log(request.result);
          var total = 0;
          request.result.forEach(elem => {
            total += elem.time_in_sec;
          });
          cb(total);
        }
      };
    };
  }

  console.log('bg');
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
    console.log(request);

    if (request.type === 'saveRequest') {
      handleDB(request.videoSave.category, request.videoSave.date, request.videoSave.time);
    }

    if (request.type === 'dataRequest') {
      queryDB(res => {
        sendResponse({
          data: {
            day: '2020-10-10',
            time: res
          }
        });
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
