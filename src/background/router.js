import restrictionsController from './controllers/restrictionsController';
import settingsController from './controllers/settingsController';
import watchtimeController from './controllers/watchtimeController';
import restrictions from './db/restrictions';
import watchtime from './db/watchtime';
import route from './route';

const router = (request, sendResponse) => {
    route('watchtime/create', () => {
        watchtimeController.create(request, sendResponse);
    });

    route('watchtime/get', () => {
        watchtimeController.index(request, sendResponse);
    });

    route('restriction/create', () => {
        restrictionsController.create(request, sendResponse);
    });

    route('restriction/get', () => {
        restrictionsController.index(request, sendResponse);
    });

    route('restriction/delete', () => {
        restrictionsController.delete(request, sendResponse);
    });

    route('settings/update', () => {
        settingsController.update(request, sendResponse);
    });

    route('settings/get', () => {
        settingsController.index(request, sendResponse);
    });

    route('checkTimeRemaining', () => {
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
    });
};

export default router;
