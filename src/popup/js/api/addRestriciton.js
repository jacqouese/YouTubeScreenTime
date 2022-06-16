export function addRestriction(restriction, time, callback) {
    chrome.extension.sendMessage(
        {
            type: 'restriction/create',
            body: { restriction: restriction, time: time },
        },
        function (res) {
            if (res.error) return console.error('error in: restriction/create');

            typeof callback === 'function' && callback(res);
            return console.log('restriction added');
        }
    );
}
