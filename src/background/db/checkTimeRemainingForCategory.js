import { queryDB } from './queryDBtest';

export function checkTimeRemainingForCategory(
  category,
  time,
  timeframe,
  callback
) {
  queryDB('restrictions', 'category', (store) => {
    var request = store.index('category').getAll([category]);
    request.onsuccess = () => {
      const remaining = request.result[0].time_in_sec - time || null;

      if (remaining === null) return callback(true, null); // restriction for given category does not exist

      if (request.result[0].timeframe !== timeframe)
        return callback(true, remaining);

      if (request.result[0].time_in_sec > time)
        return callback(true, remaining);

      return callback(false, remaining);
    };
  });
}
