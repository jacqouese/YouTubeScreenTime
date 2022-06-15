import { getAllWatched } from '../db/getAllWatched';

class WatchtimeController {
    index(request, sendResponse) {
        // watch time data request from popup
        if (request.body.period === 'day') {
            getAllWatched('day', (res) => {
                sendResponse({
                    status: 200,
                    data: {
                        time: res.totalTime,
                        categoryObject: res.categoryObject,
                        dateObject: res.dateObject,
                    },
                });
            });
        } else if (request.body.period === 'week') {
            getAllWatched('week', (res) => {
                sendResponse({
                    status: 200,
                    data: {
                        time: res.totalTime,
                        categoryObject: res.categoryObject,
                        dateObject: res.dateObject,
                    },
                });
            });
        } else if (request.body.period === 'month') {
            getAllWatched('month', (res) => {
                sendResponse({
                    status: 200,
                    data: {
                        time: res.totalTime,
                        categoryObject: res.categoryObject,
                        dateObject: res.dateObject,
                    },
                });
            });
        } else {
            sendResponse({
                status: 404,
                error: `period invalid or not given: ${request.body.period}`,
            });
        }
    }

    create(request, sendResponse) {
        handleDB(
            request.body.category,
            request.body.date,
            request.body.time,
            () => {
                getAllWatched('day', (res) => {
                    checkTimeRemainingForCategory(
                        request.body.category,
                        res.categoryObject[request.body.category],
                        'day',
                        (isTimeLeft, timeRemaining) => {
                            sendResponse({
                                status: 200,
                                data: {
                                    isTimeLeft: isTimeLeft,
                                    timeRemaining: timeRemaining,
                                },
                            });
                        }
                    );
                });
            }
        );
    }
}

export default new WatchtimeController();
