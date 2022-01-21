import { queryDB } from './queryDBtest';

export function deleteRestriction(restriction) {
  queryDB('restrictions', 'category', (store) => {
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
