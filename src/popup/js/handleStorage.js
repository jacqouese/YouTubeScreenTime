// initialize global object
window.ytData = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
});

function requestTotal(period, callback) {
  chrome.extension.sendMessage(
    { type: 'dataRequest', body: { period: period, category: 'all' } },
    function (res) {
      if (res.status !== 200)
        return console.warn('Failed to get data from background');
      callback(res);
    }
  );
}

requestTotal('day', (res) => {
  window.ytData.dayTotalCategory = res.data;
  handleDetailedTable('day');
  document.querySelector('#top-stats-day').innerHTML = secondsToHms(
    res.data.time
  );
});

requestTotal('week', (res) => {
  window.ytData.weekTotalCategory = res.data;
  chartLogic();
  document.querySelector('#top-stats-week').innerHTML = secondsToHms(
    res.data.time
  );
});

requestTotal('month', (res) => {
  window.ytData.monthTotalCategory = res.data;
  document.querySelector('#top-stats-month').innerHTML = secondsToHms(
    res.data.time
  );
});
