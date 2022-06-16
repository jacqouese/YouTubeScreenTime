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

            if (res.data.timeRemaining <= 0) {
                console.log(`%cRestriction trigger: ${category}`, 'color: red');
                return mainNotification.createSimpleNotification(
                    `Time for ${category} has run out`,
                    `The time limit you set for ${category} has run out. Check YouTube ScreenTime extension for more details.`
                );
            }

            if (res.data.timeRemaining < 300) {
                return mainNotification.createSimpleNotification(
                    `Less than 5 min for ${category}`,
                    `The time limit you set for ${category} has almost run out.`
                );
            }
        }
    );
}
