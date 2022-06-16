export function setUserSettings(settingName, settingValue) {
    chrome.extension.sendMessage(
        {
            type: 'settings/update',
            body: { settingName: settingName, settingValue: settingValue },
        },
        (res) => {
            if (res.error) return console.error('Error in: settings/update');
        }
    );
}
