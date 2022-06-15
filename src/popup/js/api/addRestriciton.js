export function addRestriction(restriction, time, callback) {
    chrome.extension.sendMessage(
        {
            type: 'addRestriction',
            body: { restriction: restriction, time: time },
        },
        function (res) {
            if (res.status === 200) {
                typeof callback === 'function' && callback();
                return console.log('restriction added');
            }

            if (res.status === 403)
                return console.log('restriction already exists');

            return console.warn('Some error occured');
        }
    );
}
