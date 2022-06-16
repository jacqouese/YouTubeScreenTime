export function requestTotal(period, callback) {
    chrome.extension.sendMessage(
        { type: 'watchtime/get', body: { period: period, category: 'all' } },
        function (res) {
            console.log(period);
            if (res.error) return console.error('Error in: watchtime/get');

            typeof callback === 'function' && callback(res);
        }
    );
}
