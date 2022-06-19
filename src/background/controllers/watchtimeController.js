import watchtime from '../db/watchtime';

class WatchtimeController {
    index(request, sendResponse) {
        const requestPeriod = request.body.period || null;

        watchtime.getAllWatched(requestPeriod, (res) => {
            sendResponse({
                status: 200,
                data: {
                    time: res.totalTime,
                    categoryObject: res.categoryObject,
                    dateObject: res.dateObject,
                    percentChange: res.percentChange,
                },
            });
        });
    }

    create(request, sendResponse) {
        watchtime.addWatched(request.body.category, request.body.date, request.body.time, () => {
            sendResponse({
                status: 200,
                data: {},
            });
        });
    }
}

export default new WatchtimeController();
