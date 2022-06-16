import restrictionsController from './controllers/restrictionsController';
import settingsController from './controllers/settingsController';
import watchtimeController from './controllers/watchtimeController';
import restrictions from './db/restrictions';
import watchtime from './db/watchtime';
import route from './route';

const router = (request, sendResponse) => {
    route('saveRequest', () => {
        watchtimeController.create(request, sendResponse);
    });

    route('dataRequest', () => {
        watchtimeController.index(request, sendResponse);
    });

    route('addRestriction', () => {
        restrictionsController.create(request, sendResponse);
    });

    route('getAllRestrictions', () => {
        restrictionsController.index(request, sendResponse);
    });

    route('deleteRestriction', () => {
        restrictionsController.delete(request, sendResponse);
    });

    route('setUserSettings', () => {
        settingsController.update(request, sendResponse);
    });

    route('getUserSettings', () => {
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
