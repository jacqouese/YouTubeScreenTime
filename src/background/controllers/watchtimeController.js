import restrictions from '../db/restrictions';
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
                },
            });
        });
    }

    create(request, sendResponse) {
        watchtime.addWatched(
            request.body.category,
            request.body.date,
            request.body.time,
            () => {
                watchtime.getAllWatched('day', (res) => {
                    restrictions.checkTimeRemainingForCategory(
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
