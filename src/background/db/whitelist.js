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
            console.log(category);
            var request = store.index('category').get(category);
            request.onsuccess = () => {
                store.put({
                    category: category,
                });
            };
        });
    }

    deleteWhitelist(category) {
        super.query(this.tableName, 'category', (store) => {
            var request = store.index('category').getAll();
            request.onsuccess = () => {
                console.log(request, category);
                request.result.forEach((elem) => {
                    if (elem.category === category) {
                        store.delete(elem.id);
                    }
                });
            };
        });
    }
}

export default new Whitelist();
