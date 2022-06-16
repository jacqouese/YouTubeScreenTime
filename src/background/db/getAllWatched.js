import { getCurrentDayBound } from '../helpers/getCurrentDayBound';
import { getCurrentMonthBound } from '../helpers/getCurrentMonthBound';
import { getCurrentWeekBound } from '../helpers/getCurrentWeekBound';
import { prepareDateObject } from '../helpers/prepareDateObject';
import { queryDB } from './queryDBtest';

export function getAllWatched(period, callback) {
    queryDB('time_logs', 'date, category', (store) => {
        // check what period was requested
        var bound = [];
        if (period === 'day') {
            bound = getCurrentDayBound();
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
            }
        };
    });
}
