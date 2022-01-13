import { queryDB } from './queryDBtest';

export function addRestriction(restriction, time) {
  queryDB('restrictions', 'category', (store) => {
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
