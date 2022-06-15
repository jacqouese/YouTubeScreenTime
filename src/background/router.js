import restrictionsController from './controllers/restrictionsController';
import settingsController from './controllers/settingsController';
import watchtimeController from './controllers/watchtimeController';
import { checkTimeRemainingForCategory } from './db/checkTimeRemainingForCategory';
import { getAllWatched } from './db/getAllWatched';
import route from './route';

const router = (request, sendResponse) => {
    route('saveRequest', () => {
        watchtimeController.create(request, sendResponse);
    });

    route('dataRequest', () => {
        console.log('ive been called');
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
    });
};

export default router;
