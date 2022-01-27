export function setUserSettings(settingName, settingValue) {
  chrome.extension.sendMessage(
    {
      type: 'setUserSettings',
      body: { settingName: settingName, settingValue: settingValue },
    },
    (res) => {
      if ((res.status !== 200 && res.status !== 201) || !res.status)
        return console.warn('something went wrong!', res.status);
    }
  );
}
