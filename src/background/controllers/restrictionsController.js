import restrictions from '../db/restrictions';
import watchtime from '../db/watchtime';

class RestrictionsController {
    index(request, sendResponse) {
        restrictions.getAllRestrictions((res) => {
            sendResponse({
                status: 200,
                data: {
                    restrictions: res,
                },
            });
        });
    }

    create(request, sendResponse) {
        restrictions.checkForRestriction(
            request.body.restriction,
            () => {
                restrictions.addRestriction(request.body.restriction, request.body.time);
                sendResponse({
                    status: 200,
                    data: {
                        ok: 'ok',
                    },
                });
            },
            () => {
                sendResponse({
                    status: 403,
                    error: 'restriction for this category already exists',
                });
            }
        );
    }

    delete(request, sendResponse) {
        restrictions.deleteRestriction(request.body.restriction);
        sendResponse({
            status: 200,
        });
    }

    indexTimeRemaining(request, sendResponse) {
        watchtime.getAllWatched('day', (res) => {
            const category = request.body.category;
            const time = res.categoryObject[request.body.category];
            restrictions.checkTimeRemainingForCategory(
                { category: category, time: time, timeframe: 'day' },
                (isTimeLeft, timeRemaining) => {
                    restrictions.checkTimeRemainingForAll(time, (res) => {
                        let finalRemaining = timeRemaining;
                        if (res !== null) {
                            finalRemaining = res < timeRemaining ? res : timeRemaining;
                        }

                        sendResponse({
                            status: 200,
                            data: {
                                timeRemaining: finalRemaining,
                            },
                        });
                    });
                }
            );
        });
    }
}

export default new RestrictionsController();
