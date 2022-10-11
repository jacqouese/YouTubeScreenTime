import getHrefSubpage from '../helpers/getHrefSubpage';
import FocusModeService from '../service/focusModeService';
import waitForElementLoad from '../utils/waitForElementLoad';

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

    getUserSettings('displayCategory', (res) => {
        window.ytData.settings.displayCategory = res.data.settingValue;
    });

    getUserSettings('lowTimeNotifications', (res) => {
        window.ytData.settings.lowTimeNotifications = res.data.settingValue;
    });

    getUserSettings('disableNotifications', (res) => {
        window.ytData.settings.disableNotifications = res.data.settingValue;
    });

    getUserSettings('focusMode', (res) => {
        window.ytData.settings.focusMode = res.data.settingValue;
    });

    getUserSettings('isExtensionPaused', (res) => {
        window.ytData.settings.isExtensionPaused = res.data.settingValue;
        callback();
    });

    const focusObject = new FocusModeService();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('got message', request);
        if (request.type === 'settingChange') {
            window.ytData.settings[request.body.settingName] = request.body.settingValue;
            callback();
        }
    });
}
