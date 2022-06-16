export function getUserSettings(settingName, callback) {
    chrome.extension.sendMessage(
        { type: 'settings/get', body: { settingName: settingName } },
        (res) => {
            if (res.error) return console.error('Error in: settings/get');

            typeof callback === 'function' && callback(res);
        }
    );
}
