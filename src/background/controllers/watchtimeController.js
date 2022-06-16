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
                    const category = request.body.category;
                    const time = res.categoryObject[request.body.category];
                    restrictions.checkTimeRemainingForCategory(
                        { category: category, time: time, timeframe: 'day' },
                        (isTimeLeft, timeRemaining) => {
                            restrictions.checkTimeRemainingForAll(
                                time,
                                (res) => {
                                    let finalRemaining = timeRemaining;
                                    if (res !== null) {
                                        finalRemaining =
                                            res < timeRemaining
                                                ? res
                                                : timeRemaining;
                                    }

                                    sendResponse({
                                        status: 200,
                                        data: {
                                            timeRemaining: finalRemaining,
                                        },
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    }
}

export default new WatchtimeController();
