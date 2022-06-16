import settings from '../localStorage/settings';

class SettingsController {
    index(request, sendResponse) {
        const setting = settings.getSettingValue(request.body.settingName);

        sendResponse({
            status: 200,
            data: {
                settingName: request.body.settingName,
                settingValue: setting,
            },
        });
    }

    update(request, sendResponse) {
        settings.updateSettingValue(
            request.body.settingName,
            request.body.settingValue
        );
        sendResponse({
            status: 201,
            message: 'setting added successfully',
        });

        // notify content about setting change
        chrome.tabs.query({}, (tabs) => {
            for (var i = 0; i < tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, {
                    type: 'settingChange',
                    body: {
                        settingName: request.body.settingName,
                        settingValue: request.body.settingValue,
                    },
                });
            }
        });

        // notify popup about setting change
        chrome.extension.sendMessage({
            type: 'settingChange',
            body: {
                settingName: request.body.settingName,
                settingValue: request.body.settingValue,
            },
        });
    }
}

export default new SettingsController();
