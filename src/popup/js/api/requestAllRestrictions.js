export function requestAllRestricions(callback) {
    chrome.extension.sendMessage(
        { type: 'restriction/get', body: {} },
        (res) => {
            if (res.error) return console.error('Error in: restriction/get');

            typeof callback === 'function' && callback(res);
        }
    );
}
