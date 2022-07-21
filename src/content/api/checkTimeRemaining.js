import { globalState, setState } from '../state/state';
import { cLog } from '../utils/utils';

export function checkTimeRemaining(category) {
    chrome.runtime.sendMessage(
        {
            for: 'background',
            type: 'restrictions/timeremaining',
            body: {
                category: category,
                timeframe: 'day',
            },
        },
        (res) => {
            if (res.data.timeRemaining === null) return cLog(`no restrictions found: ${category}`);

            cLog(`${res.data.timeRemaining} seconds left`);

            // user paused notifications
            if (window.ytData.settings.disableNotifications == 'true') return;

            if (res.data.timeRemaining <= 0) {
                if (globalState.hasShownNotification.state === true) return;
                setState('hasShownNotification', true);
                return mainNotification.createNoTimeNotification(res.data.ifSpecific ? category : 'today');
            }

            if (res.data.timeRemaining < 300 && window.ytData.settings.lowTimeNotifications == 'true') {
                if (globalState.hasShownWarning.state === true) return;
                setState('hasShownWarning', true);
                return mainNotification.createLowTimeNotification(res.data.ifSpecific ? category : 'today');
            }
        }
    );
}
