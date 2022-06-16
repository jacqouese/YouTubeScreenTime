import restrictions from '../db/restrictions';

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
                restrictions.addRestriction(
                    request.body.restriction,
                    request.body.time
                );
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
}

export default new RestrictionsController();
