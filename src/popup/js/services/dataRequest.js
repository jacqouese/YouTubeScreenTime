export class dataRequest {
    static call({ type, body }, callback) {
        chrome.extension.sendMessage({ type: type, body: body }, (res) => {
            if (res.error) return console.error('Error in: ' + type, res.error);

            typeof callback === 'function' && callback(res);
        });
    }
}
