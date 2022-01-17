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
      const errorCallback = (msg) => {
        console.log(`%c${msg}`, 'background-color: green');
      };

      if (!request.result) return callback(true);
      if (request.result.length < 1) return callback(true);

      if (request.result[0].timeframe !== timeframe) return callback(true);
      if (request.result[0].time_in_sec > time) return callback(true);

      return callback(false);
    };
  });
}
