export function checkIfCanWatchInFocus(category, callback) {
    chrome.runtime.sendMessage(
        {
            for: 'background',
            type: 'whitelist/check',
            body: {
                category: category,
            },
        },
        (res) => {
            if (res.data.canWatch === true) return callback(true);

            return callback(false);
        }
    );
}
