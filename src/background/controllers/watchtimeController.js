import { getAllWatched } from '../db/getAllWatched';

class WatchtimeController {
    index(request, sendResponse) {
        const requestPeriod = request.body.period || null;

        getAllWatched(requestPeriod, (res) => {
            sendResponse({
                status: 200,
                data: {
                    time: res.totalTime,
                    categoryObject: res.categoryObject,
                    dateObject: res.dateObject,
                },
            });
        });
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
