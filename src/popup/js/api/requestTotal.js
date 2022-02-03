export function requestTotal(period, callback) {
  chrome.extension.sendMessage(
    { type: 'dataRequest', body: { period: period, category: 'all' } },
    function (res) {
      console.log(period);
      if (res.status !== 200)
        return console.warn('Failed to get data from background');
      callback(res);
    }
  );
}
