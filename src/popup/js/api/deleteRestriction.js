export function deleteRestriction(restriction, callback) {
    chrome.extension.sendMessage(
        {
            type: 'restriction/delete',
            body: { restriction: restriction },
        },
        function (res) {
            if (res.error) return console.error('Error in: restriction/delete');

            typeof callback === 'function' && callback(res);
        }
    );
}
