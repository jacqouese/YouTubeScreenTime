export function listenForSettingChanges(callback) {
    window.ytData = {};
    window.ytData.settings = {};

    // get settings after launching
    function getUserSettings(settingName, callback) {
        chrome.extension.sendMessage({ type: 'settings/get', body: { settingName: settingName } }, (res) => {
            if ((res.status !== 200 && res.status !== 201) || !res.status)
                return console.warn('something went wrong!', res.status);

            callback(res);
        });
    }

    const settingOptions = [
        'displayCategory',
        'lowTimeNotifications',
        'disableNotifications',
        'focusMode',
        'hideSuggestions',
        'redirectHomepage',
    ];

    settingOptions.forEach((setting) => {
        getUserSettings(setting, (res) => {
            window.ytData.settings[setting] = res.data.settingValue;
        });
    });

    getUserSettings('isExtensionPaused', (res) => {
        window.ytData.settings.isExtensionPaused = res.data.settingValue;
        callback();
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('got message', request);
        if (request.type === 'settingChange') {
            window.ytData.settings[request.body.settingName] = request.body.settingValue;
            callback();
        }
    });
}
