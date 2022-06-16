import DBModel from './db';

class Restrictions extends DBModel {
    constructor() {
        super();
        this.tableName = 'restrictions';
    }

    getAllRestrictions(callback) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll();
            request.onsuccess = () => {
                console.log(request.result);
                callback(request.result);
            };
        });
    }

    checkForRestriction(category, callback, errorCallback) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll();
            request.onsuccess = () => {
                if (!request.result.includes(category)) return callback();

                return errorCallback();
            };
        });
    }

    addRestriction(restriction, time) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').get(restriction);
            request.onsuccess = () => {
                store.put({
                    category: restriction,
                    time_in_sec: time,
                    timeframe: 'day',
                });
            };
        });
    }

    deleteRestriction(restriction) {
        this.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll();
            request.onsuccess = () => {
                request.result.forEach((elem) => {
                    if (elem.category === restriction) {
                        store.delete(elem.id);
                    }
                });
            };
        });
    }

    checkTimeRemainingForCategory({ category, time, timeframe }, callback) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll([category]);
            request.onsuccess = () => {
                if (request.result.length === 0) {
                    return callback(true, null); // restriction for given category does not exist
                }

                const remaining = request.result[0].time_in_sec - time || null;

                if (request.result[0].timeframe !== timeframe)
                    return callback(true, remaining);

                if (request.result[0].time_in_sec > time)
                    return callback(true, remaining);

                return callback(false, remaining);
            };
        });
    }

    checkTimeRemainingForAll(time, callback) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll(['all']);
            request.onsuccess = () => {
                if (request.result.length === 0) return callback(null);

                const remaining = request.result[0].time_in_sec - time;

                return callback(remaining);
            };
        });
    }

    checkTimeRemainingForCategoryRestructure(
        category,
        time,
        timeframe,
        callback
    ) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll([category]);
            request.onsuccess = () => {
                if (request.result.length === 0) return null;

                const remaining = request.result[0].time_in_sec - time;

                return remaining;
            };
        });
    }
}

export default new Restrictions();
