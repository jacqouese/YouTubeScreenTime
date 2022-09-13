import restrictionsController from './controllers/restrictionsController';
import settingsController from './controllers/settingsController';
import watchtimeController from './controllers/watchtimeController';
import whitelistController from './controllers/whitelistController';
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

    route('restrictions/timeremaining', () => {
        restrictionsController.indexTimeRemaining(request, sendResponse);
    });

    route('whitelist/get', () => {
        whitelistController.index(request, sendResponse);
    });

    route('whitelist/create', () => {
        whitelistController.create(request, sendResponse);
    });

    route('whitelist/delete', () => {
        whitelistController.delete(request, sendResponse);
    });

    route('whitelist/check', () => {
        whitelistController.check(request, sendResponse);
    });

    route('settings/update', () => {
        settingsController.update(request, sendResponse);
    });

    route('settings/get', () => {
        settingsController.index(request, sendResponse);
    });
};

export default router;
