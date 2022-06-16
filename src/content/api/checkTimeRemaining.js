export function checkTimeRemaining(category) {
    chrome.runtime.sendMessage(
        {
            for: 'background',
            type: 'checkTimeRemaining',
            body: {
                category: category,
                timeframe: 'day',
            },
        },
        (res) => {
            if (res.data.timeRemaining === null)
                return console.log('no restrictions found:', category);

            console.log(`${res.data.timeRemaining} seconds left`);

            // user paused notifications
            if (window.ytData.settings.disableNotifications == 'true') return;

            if (res.data.timeRemaining <= 0) {
                return mainNotification.createNoTimeNotification(category);
            }

            if (
                res.data.timeRemaining < 300 &&
                window.ytData.settings.lowTimeNotifications == 'true'
            ) {
                return mainNotification.createLowTimeNotification(category);
            }
        }
    );
}
