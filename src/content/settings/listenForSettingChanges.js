import { injectCategoryString } from '../inject/injectCategoryString';

export function listenForSettingChanges() {
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

    getUserSettings('displayCategory', (res) => {
        window.ytData.settings.displayCategory = res.data.settingValue;
    });

    getUserSettings('lowTimeNotifications', (res) => {
        window.ytData.settings.lowTimeNotifications = res.data.settingValue;
    });

    getUserSettings('disableNotifications', (res) => {
        window.ytData.settings.disableNotifications = res.data.settingValue;
    });

    getUserSettings('isExtensionPaused', (res) => {
        window.ytData.settings.isExtensionPaused = res.data.settingValue;
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('got message', request);
        if (request.type === 'settingChange') {
            window.ytData.settings[request.body.settingName] = request.body.settingValue;
        }
        if (request.type === 'newURL') {
            setTimeout(() => {
                if (window.ytData.settings.displayCategory == 'true') {
                    injectCategoryString();
                }
            }, 1000);
        }
    });
}
