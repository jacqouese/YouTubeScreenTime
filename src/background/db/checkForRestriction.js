import { queryDB } from './queryDBtest';

export function checkForRestriction(category, callback, errorCallback) {
  queryDB('restrictions', 'category', (store) => {
    var request = store.index('category').getAll();
    request.onsuccess = () => {
      if (!request.result) return errorCallback();
      if (request.result.length < 1) return errorCallback();

      if (request.result.includes(category)) return errorCallback();

      return callback();
    };
  });
}
