export function requestAllWhitelisted(callback) {
    chrome.extension.sendMessage({ type: 'whitelist/get', body: {} }, (res) => {
        if (res.error) return console.error('Error in: restriction/get');

        typeof callback === 'function' && callback(res);
    });
}
