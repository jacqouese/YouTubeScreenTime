import { addRestriction } from '../db/addRestriction';
import { checkForRestriction } from '../db/checkForRestriction';
import { deleteRestriction } from '../db/deleteRestriction';
import { getAllRestrictions } from '../db/getAllRestrictions';

class RestrictionsController {
    index(request, sendResponse) {
        getAllRestrictions((res) => {
            sendResponse({
                status: 200,
                data: {
                    restrictions: res,
                },
            });
        });
    }

    create(request, sendResponse) {
        checkForRestriction(
            request.body.restriction,
            () => {
                console.log('here');
                addRestriction(request.body.restriction, request.body.time);
                sendResponse({
                    status: 200,
                    data: {
                        ok: 'ok',
                    },
                });
            },
            () => {
                console.log('here');
                sendResponse({
                    status: 403,
                    error: 'restriction for this category already exists',
                });
            }
        );
    }

    delete(request, sendResponse) {
        deleteRestriction(request.body.restriction);
        sendResponse({
            status: 200,
        });
    }
}

export default new RestrictionsController();
