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

    class DBModel {
      constructor() {
        this.dbName = 'YouTubeScreenTime';
        this.dbVersion = 1;
      }

      query(tableName, tableIndex, callback) {
        let openRequest = indexedDB.open(this.dbName, this.dbVersion),
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

    }

    class Restrictions extends DBModel {
      constructor() {
        super();
        this.tableName = 'restrictions';
      }

      getAllRestrictions(callback) {
        super.query(this.tableName, 'category', store => {
          var request = store.index('category').getAll();

          request.onsuccess = () => {
            console.log(request.result);
            callback(request.result);
          };
        });
      }

      checkForRestriction(category, callback, errorCallback) {
        super.query(this.tableName, 'category', store => {
          var request = store.index('category').getAll();

          request.onsuccess = () => {
            if (!request.result.includes(category)) return callback();
            return errorCallback();
          };
        });
      }

      addRestriction(restriction, time) {
        super.query(this.tableName, 'category', store => {
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

      deleteRestriction(restriction) {
        this.query(this.tableName, 'category', store => {
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

      checkTimeRemainingForCategory({
        category,
        time,
        timeframe
      }, callback) {
        super.query(this.tableName, 'category', store => {
          var request = store.index('category').getAll([category]);

          request.onsuccess = () => {
            if (request.result.length === 0) {
              return callback(true, null); // restriction for given category does not exist
            }

            const remaining = request.result[0].time_in_sec - time || null;
            if (request.result[0].timeframe !== timeframe) return callback(true, remaining);
            if (request.result[0].time_in_sec > time) return callback(true, remaining);
            return callback(false, remaining);
          };
        });
      }

      checkTimeRemainingForAll(time, callback) {
        super.query(this.tableName, 'category', store => {
          var request = store.index('category').getAll(['All']);

          request.onsuccess = () => {
            if (request.result.length === 0) return callback(null);
            const remaining = request.result[0].time_in_sec - time;
            return callback(remaining);
          };
        });
      } // checkTimeRemainingForCategoryRestructure(category, time, timeframe, callback) {
      //     super.query(this.tableName, 'category', (store) => {
      //         var request = store.index('category').getAll([category]);
      //         request.onsuccess = () => {
      //             if (request.result.length === 0) return null;
      //             const remaining = request.result[0].time_in_sec - time;
      //             return remaining;
      //         };
      //     });
      // }


    }

    var restrictions = new Restrictions();

    function prepareDateObject(dateBound) {
      const object = {};
      dateBound.forEach(singleDate => {
        object[singleDate] = {};
      });
      return object;
    }

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
      tempDate.setDate( // initially first day of the current week
      curr.getDate() - curr.getDay() + (curr.getDay() == 0 ? -6 : 1) // make Sunday the last day
      );

      for (let i = 0; i <= 6; i++) {
        var dateDateFormated = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
        arrayOfDays.push(dateDateFormated);
        tempDate.setDate(tempDate.getDate() + 1);
      }

      return arrayOfDays;
    }

    function getLastDayBound() {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate() - 1);
      return [date];
    }

    function getLastMonthBound() {
      var arrayOfDays = [];
      var curr = new Date(); // get current date

      const daysInMonth = new Date(curr.getFullYear(), curr.getMonth(), 0).getDate(); // returns how many days the current month has

      for (let i = 1; i <= daysInMonth; i++) {
        var tempDate = new Date(curr.setDate(i));
        var dateDateFormated = tempDate.getFullYear() + '-' + tempDate.getMonth() + '-' + tempDate.getDate();
        arrayOfDays.push(dateDateFormated);
      }

      return arrayOfDays;
    }

    function getLastWeekBound() {
      var arrayOfDays = [];
      var curr = new Date(); // get current date

      const tempDate = new Date();
      tempDate.setDate( // initially first day of the current week
      curr.getDate() - curr.getDay() + (curr.getDay() == 0 ? -13 : -6) // make Sunday the last day
      );

      for (let i = 0; i <= 6; i++) {
        var dateDateFormated = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
        arrayOfDays.push(dateDateFormated);
        tempDate.setDate(tempDate.getDate() + 1);
      }

      return arrayOfDays;
    }

    function determineBound(period) {
      if (period === 'day') {
        return getCurrentDayBound();
      }

      if (period === 'week') {
        return getCurrentWeekBound();
      }

      if (period === 'month') {
        return getCurrentMonthBound();
      }

      if (period === 'lastday') {
        return getLastDayBound();
      }

      if (period === 'lastweek') {
        return getLastWeekBound();
      }

      if (period === 'lastmonth') {
        return getLastMonthBound();
      }

      return console.error('invalid period given, valid period values include: day, week, month');
    }

    class Watchtime extends DBModel {
      constructor() {
        super();
        this.tableName = 'time_logs';
      }

      getAllWatched(period, callback) {
        super.query(this.tableName, 'date, category', store => {
          // check what period was requested
          var bound = determineBound(period);
          var compareBound = determineBound('last' + period);
          var request = store.index('date').getAll();

          request.onsuccess = () => {
            if (request.result.length === 0) return;
            var total = 0;
            var previousWeekTotal = 0;
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

              if (compareBound.includes(elem.date)) {
                previousWeekTotal += elem.time_in_sec;
              }
            });

            const determinePercentChange = () => {
              if (total === 0 || previousWeekTotal === 0) return 0;
              return Math.round((total - previousWeekTotal) / previousWeekTotal * 100);
            };

            const percentChange = determinePercentChange();
            const data = {
              totalTime: total,
              categoryObject: categoryObject,
              dateObject: dateObject,
              percentChange: percentChange
            };
            callback(data);
          };
        });
      }

      addWatched(category, logTime, time, callback) {
        super.query(this.tableName, 'date, category', store => {
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

            callback();
          };

          request.onerror = () => {
            console.warn('error in watchtime db');
          };
        });
      }

    }

    var watchtime = new Watchtime();

    class RestrictionsController {
      index(request, sendResponse) {
        restrictions.getAllRestrictions(res => {
          sendResponse({
            status: 200,
            data: {
              restrictions: res
            }
          });
        });
      }

      create(request, sendResponse) {
        restrictions.checkForRestriction(request.body.restriction, () => {
          restrictions.addRestriction(request.body.restriction, request.body.time);
          sendResponse({
            status: 200,
            data: {
              ok: 'ok'
            }
          });
        }, () => {
          sendResponse({
            status: 403,
            error: 'restriction for this category already exists'
          });
        });
      }

      delete(request, sendResponse) {
        restrictions.deleteRestriction(request.body.restriction);
        sendResponse({
          status: 200
        });
      }

      indexTimeRemaining(request, sendResponse) {
        watchtime.getAllWatched('day', res => {
          const category = request.body.category;
          const time = res.categoryObject[request.body.category];
          restrictions.checkTimeRemainingForCategory({
            category: category,
            time: time,
            timeframe: 'day'
          }, (isTimeLeft, timeRemaining) => {
            console.log(timeRemaining);
            restrictions.checkTimeRemainingForAll(time, res => {
              let finalRemaining = timeRemaining;
              let ifSpecific = true;

              if (res !== null) {
                finalRemaining = res > timeRemaining ? res : timeRemaining;
                ifSpecific = res > timeRemaining ? false : true;
              }

              sendResponse({
                status: 200,
                data: {
                  ifSpecific: ifSpecific,
                  timeRemaining: finalRemaining
                }
              });
            });
          });
        });
      }

    }

    var restrictionsController = new RestrictionsController();

    class Settings {
      getSettingValue(settingName) {
        const setting = localStorage.getItem(settingName); // if setting does not already exist - create it

        if (setting === null) {
          localStorage.setItem(settingName, false);
        }

        return setting;
      }

      updateSettingValue(settingName, settingValue) {
        localStorage.setItem(settingName, settingValue);
      }

    }

    var settings = new Settings();

    class SettingsController {
      index(request, sendResponse) {
        const setting = settings.getSettingValue(request.body.settingName);
        sendResponse({
          status: 200,
          data: {
            settingName: request.body.settingName,
            settingValue: setting
          }
        });
      }

      update(request, sendResponse) {
        settings.updateSettingValue(request.body.settingName, request.body.settingValue);
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

    class WatchtimeController {
      index(request, sendResponse) {
        const requestPeriod = request.body.period || null;
        watchtime.getAllWatched(requestPeriod, res => {
          sendResponse({
            status: 200,
            data: {
              time: res.totalTime,
              categoryObject: res.categoryObject,
              dateObject: res.dateObject,
              percentChange: res.percentChange
            }
          });
        });
      }

      create(request, sendResponse) {
        watchtime.addWatched(request.body.category, request.body.date, request.body.time, () => {
          sendResponse({
            status: 200,
            data: {}
          });
        });
      }

    }

    var watchtimeController = new WatchtimeController();

    const router = (request, sendResponse) => {
      route('watchtime/create', () => {
        watchtimeController.create(request, sendResponse);
      });
      route('watchtime/get', () => {
        watchtimeController.index(request, sendResponse);
      });
      route('restriction/create', () => {
        restrictionsController.create(request, sendResponse);
      });
      route('restriction/get', () => {
        restrictionsController.index(request, sendResponse);
      });
      route('restriction/delete', () => {
        restrictionsController.delete(request, sendResponse);
      });
      route('restrictions/timeremaining', () => {
        restrictionsController.indexTimeRemaining(request, sendResponse);
      });
      route('settings/update', () => {
        settingsController.update(request, sendResponse);
      });
      route('settings/get', () => {
        settingsController.index(request, sendResponse);
      });
    };

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      // console.log(
      //     sender.tab
      //         ? 'from a content script:' + sender.tab.url
      //         : 'from the extension'
      // );
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
