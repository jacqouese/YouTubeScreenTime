(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('router', factory) :
    (global = global || self, global.router = factory());
}(this, (function () { 'use strict';

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
          var request = store.index('category').getAll(['all']);

          request.onsuccess = () => {
            if (request.result.length === 0) return callback(null);
            const remaining = request.result[0].time_in_sec - time;
            return callback(remaining);
          };
        });
      }

      checkTimeRemainingForCategoryRestructure(category, time, timeframe, callback) {
        super.query(this.tableName, 'category', store => {
          var request = store.index('category').getAll([category]);

          request.onsuccess = () => {
            if (request.result.length === 0) return null;
            const remaining = request.result[0].time_in_sec - time;
            return remaining;
          };
        });
      }

    }

    new Restrictions();

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

    new Watchtime();

    const router = (request, sendResponse) => {
    };

    return router;

})));
