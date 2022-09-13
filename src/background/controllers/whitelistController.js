import whitelist from '../db/whitelist';

class WhitelistController {
    index(request, sendResponse) {
        whitelist.getWhitelist((res) => {
            sendResponse({
                status: 200,
                data: {
                    whitelist: res,
                },
            });
        });
    }

    create(request, sendResponse) {
        whitelist.addWhitelist(request.body.category, () => {
            sendResponse({
                status: 200,
                data: {},
            });
        });
    }

    delete(request, sendResponse) {
        whitelist.deleteWhitelist(request.body.category, () => {
            sendResponse({
                status: 200,
                data: {},
            });
        });
    }

    check(request, sendResponse) {
        whitelist.checkIfCanWatch(request.body.category, (res) => {
            sendResponse({
                status: 200,
                data: {
                    canWatch: res,
                },
            });
        });
    }
}

export default new WhitelistController();
