import { prepareDateObject } from '../helpers/prepareDateObject';
import { determineBound } from '../service/boundService';
import DBModel from './db';

class Watchtime extends DBModel {
    constructor() {
        super();
        this.tableName = 'time_logs';
    }

    getAllWatched(period, callback) {
        super.query(this.tableName, 'date, category', (store) => {
            // check what period was requested
            var bound = determineBound(period);

            var request = store.index('date').getAll();

            request.onsuccess = () => {
                if (request.result.length === 0) return;

                var total = 0;
                var categoryObject = {};
                var dateObject = prepareDateObject(bound);
                request.result.forEach((elem) => {
                    if (bound.includes(elem.date)) {
                        // insert data into category object
                        if (elem.category in categoryObject) {
                            // if the category already is in array
                            categoryObject[elem.category] =
                                categoryObject[elem.category] +
                                elem.time_in_sec;
                        } else {
                            // if the category is not in array already
                            categoryObject[elem.category] = elem.time_in_sec;
                        }

                        // insert data into date object
                        if (elem.category in dateObject[elem.date]) {
                            dateObject[elem.date][elem.category] =
                                dateObject[elem.date][elem.category] +
                                elem.time_in_sec;
                        } else {
                            dateObject[elem.date][elem.category] =
                                elem.time_in_sec;
                        }
                        total += elem.time_in_sec;
                    }
                });

                const data = {
                    totalTime: total,
                    categoryObject: categoryObject,
                    dateObject: dateObject,
                };

                callback(data);
            };
        });
    }

    addWatched(category, logTime, time, callback) {
        super.query(this.tableName, 'date, category', (store) => {
            var today = new Date();

            var date =
                today.getFullYear() +
                '-' +
                (today.getMonth() + 1) +
                '-' +
                today.getDate();

            var request = store
                .index('date, category')
                .getAll([date, category]);

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
                    var obj = {
                        category: category,
                        date: logTime,
                        time_in_sec: time,
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

export default new Watchtime();
