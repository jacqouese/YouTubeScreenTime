(function (factory) {
    typeof define === 'function' && define.amd ? define('background', factory) :
    factory();
}((function () { 'use strict';

    const routes = {};

    const route = (path, action) => {
      return routes[path] = action;
    };

    function upgradeDB(openRequest, store, index) {
      const db = openRequest.result; // create time_log table

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
        upgradeDB(openRequest, store, index);
      };

      openRequest.onerror = e => {
        return console.error(tableName, e.target.error);
      };

      openRequest.onsuccess = e => {
        db = openRequest.result;
        tx = db.transaction(tableName, 'readwrite');
        store = tx.objectStore(tableName);
        index = store.index(tableIndex);

        db.onerror = e => {
          return console.error(tableName, e.target.error);
        };

        callback(store);
      };
    }

    function addRestriction(restriction, time) {
      queryDB('restrictions', 'category', store => {
        var request = store.index('category').get(restriction);

        request.onsuccess = () => {
          store.put({
            category: restriction,
            time_in_sec: time,
            timeframe: 'day'
          });
        };
      });
    }

    function checkForRestriction(category, callback, errorCallback) {
      queryDB('restrictions', 'category', store => {
        var request = store.index('category').getAll();

        request.onsuccess = () => {
          if (!request.result.includes(category)) return callback();
          return errorCallback();
        };
      });
    }

    function deleteRestriction(restriction) {
      queryDB('restrictions', 'category', store => {
        var request = store.index('category').getAll();

        request.onsuccess = () => {
          request.result.forEach(elem => {
            if (elem.category === restriction) {
              store.delete(elem.id);
            }
          });
        };
      });
    }

    function getAllRestrictions(callback) {
      queryDB('restrictions', 'category', store => {
        var request = store.index('category').getAll();

        request.onsuccess = () => {
          console.log(request.result);
          callback(request.result);
        };
      });
    }

    class RestrictionsController {
      index(request, sendResponse) {
        getAllRestrictions(res => {
          sendResponse({
            status: 200,
            data: {
              restrictions: res
            }
          });
        });
      }

      create(request, sendResponse) {
        checkForRestriction(request.body.restriction, () => {
          console.log('here');
          addRestriction(request.body.restriction, request.body.time);
          sendResponse({
            status: 200,
            data: {
              ok: 'ok'
            }
          });
        }, () => {
          console.log('here');
          sendResponse({
            status: 403,
            error: 'restriction for this category already exists'
          });
        });
      }

      delete(request, sendResponse) {
        deleteRestriction(request.body.restriction);
        sendResponse({
          status: 200
        });
      }

    }

    var restrictionsController = new RestrictionsController();

    class SettingsController {
      index(request, sendResponse) {
        const setting = localStorage.getItem(request.body.settingName);

        if (setting === null) {
          localStorage.setItem(request.body.settingName, false);
        }

        sendResponse({
          status: 200,
          data: {
            settingName: request.body.settingName,
            settingValue: setting
          }
        });
      }

      update(request, sendResponse) {
        localStorage.setItem(request.body.settingName, request.body.settingValue);
        sendResponse({
          status: 201,
          message: 'setting added successfully'
        }); // notify content about setting change

        chrome.tabs.query({}, tabs => {
          for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, {
              type: 'settingChange',
              body: {
                settingName: request.body.settingName,
                settingValue: request.body.settingValue
              }
            });
          }
        }); // notify popup about setting change

        chrome.extension.sendMessage({
          type: 'settingChange',
          body: {
            settingName: request.body.settingName,
            settingValue: request.body.settingValue
          }
        });
      }

    }

    var settingsController = new SettingsController();

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

      const tempDate = new Date();
      tempDate.setDate(curr.getDate() - curr.getDay() + 1); // initially first day of the current week

      for (let i = 0; i <= 6; i++) {
        var dateDateFormated = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
        arrayOfDays.push(dateDateFormated);
        tempDate.setDate(tempDate.getDate() + 1);
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

            for (let i = 0; i < categoryObject.length; i++) {
              const element = array[i];
            }

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

    class WatchtimeController {
      index(request, sendResponse) {
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
      }

      create(request, sendResponse) {
        handleDB(request.body.category, request.body.date, request.body.time, () => {
          getAllWatched('day', res => {
            checkTimeRemainingForCategory(request.body.category, res.categoryObject[request.body.category], 'day', (isTimeLeft, timeRemaining) => {
              sendResponse({
                status: 200,
                data: {
                  isTimeLeft: isTimeLeft,
                  timeRemaining: timeRemaining
                }
              });
            });
          });
        });
      }

    }

    var watchtimeController = new WatchtimeController();

    function checkTimeRemainingForCategory$1(category, time, timeframe, callback) {
      queryDB('restrictions', 'category', store => {
        var request = store.index('category').getAll([category]);

        request.onsuccess = () => {
          const remaining = request.result[0].time_in_sec - time || null;
          if (remaining === null) return callback(true, null); // restriction for given category does not exist

          if (request.result[0].timeframe !== timeframe) return callback(true, remaining);
          if (request.result[0].time_in_sec > time) return callback(true, remaining);
          return callback(false, remaining);
        };
      });
    }

    const router = (request, sendResponse) => {
      route('saveRequest', () => {
        watchtimeController.create(request, sendResponse);
      });
      route('dataRequest', () => {
        console.log('ive been called');
        watchtimeController.index(request, sendResponse);
      });
      route('addRestriction', () => {
        restrictionsController.create(request, sendResponse);
      });
      route('getAllRestrictions', () => {
        restrictionsController.index(request, sendResponse);
      });
      route('deleteRestriction', () => {
        restrictionsController.delete(request, sendResponse);
      });
      route('setUserSettings', () => {
        settingsController.update(request, sendResponse);
      });
      route('getUserSettings', () => {
        settingsController.index(request, sendResponse);
      });
      route('checkTimeRemaining', () => {
        getAllWatched('day', res => {
          checkTimeRemainingForCategory$1(request.body.category, res.categoryObject[request.body.category], 'day', (isTimeLeft, timeRemaining) => {
            sendResponse({
              status: 200,
              data: {
                isTimeLeft: isTimeLeft,
                timeRemaining: timeRemaining
              }
            });
          });
        });
      });
    };

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
      console.log(request);
      router(request, sendResponse);

      try {
        routes[request.type]();
      } catch (e) {
        sendResponse({
          status: 404,
          error: `request type invalid: "${request.type}"`
        });
      }

      return true; // prevent closed connection error
    }); // send message to tab when its URL changes

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      if (changeInfo && changeInfo.status == 'complete') {
        console.log('Tab updated: ');
        chrome.tabs.sendMessage(tabId, {
          type: 'newURL'
        });
      }
    });

})));
