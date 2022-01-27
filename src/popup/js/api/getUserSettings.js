export function getUserSettings(settingName, callback) {
  chrome.extension.sendMessage(
    { type: 'getUserSettings', body: { settingName: settingName } },
    (res) => {
      if ((res.status !== 200 && res.status !== 201) || !res.status)
        return console.warn('something went wrong!', res.status);

      callback(res);
    }
  );
}
