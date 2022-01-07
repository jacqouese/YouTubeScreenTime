import { queryDB } from './queryDBtest';

function checkForRestriction(category) {
  queryDB('restrictions', 'category', (store) => {
    var request = store.index('category').get(category);
    request.onsuccess = () => {
      if (request.result.length > 0) {
        return true;
      } else {
        return false;
      }
    };
  });
}
