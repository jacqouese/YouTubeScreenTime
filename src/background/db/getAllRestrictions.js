import { queryDB } from './queryDBtest';

export function getAllRestrictions(callback) {
  queryDB('restrictions', 'category', (store) => {
    var request = store.index('category').getAll();
    request.onsuccess = () => {
      console.log(request.result);
      callback(request.result);
    };
  });
}
