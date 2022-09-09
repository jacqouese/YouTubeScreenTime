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
        whitelist.addWatched(request.body.category, request.body.date, request.body.time, () => {
            sendResponse({
                status: 200,
                data: {},
            });
        });
    }
}

export default new WhitelistController();
