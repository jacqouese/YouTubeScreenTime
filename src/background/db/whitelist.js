import DBModel from './db';

class Whitelist extends DBModel {
    constructor() {
        super();
        this.tableName = 'whitelist';
    }

    getWhitelist(callback) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll();
            request.onsuccess = () => {
                console.log(request.result);
                callback(request.result);
            };
        });
    }

    addWhitelist(category) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').get(category);
            request.onsuccess = () => {
                store.put({
                    category: category,
                });
            };
        });
    }
}

export default new Whitelist();
