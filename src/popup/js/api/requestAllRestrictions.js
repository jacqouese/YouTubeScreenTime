export function requestAllRestricions(callback) {
  chrome.extension.sendMessage(
    { type: 'getAllRestrictions', body: {} },
    (res) => {
      if (res.status !== 200 || !res.status)
        return console.warn('something went wrong!');

      callback(res);
    }
  );
}
