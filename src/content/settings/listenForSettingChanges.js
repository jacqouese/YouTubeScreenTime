export function listenForSettingChanges() {
    window.ytData = {};
    window.ytData.settings = {};

    // get settings after launching
    function getUserSettings(settingName, callback) {
        chrome.extension.sendMessage(
            { type: 'settings/get', body: { settingName: settingName } },
            (res) => {
                if ((res.status !== 200 && res.status !== 201) || !res.status)
                    return console.warn('something went wrong!', res.status);

                callback(res);
            }
        );
    }

    getUserSettings('displayCategory', (res) => {
        window.ytData.settings.displayCategory = res.data.settingValue;
    });

    getUserSettings('lowTimeNotifications', (res) => {
        window.ytData.settings.lowTimeNotifications = res.data.settingValue;
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        window.ytData.settings[request.body.settingName] =
            request.body.settingValue;
    });
}
