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
}

export default new WhitelistController();
