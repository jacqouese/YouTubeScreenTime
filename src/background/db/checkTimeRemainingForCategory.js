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
      if (!request.result) return callback(true, null);
      if (request.result.length < 1) return callback(true, null);

      if (request.result[0].timeframe !== timeframe)
        return callback(true, null);

      if (request.result[0].time_in_sec > time) return callback(true, null);

      return callback(false, request.result[0].time_in_sec);
    };
  });
}
