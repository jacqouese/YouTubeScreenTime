import { requestTotal } from './requestTotal';
import { secondsToHms } from '../helpers/secondsToHms';

export function loadData(callback) {
  // initialize global object
  window.ytData = {};

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
  });

  // request total for each period
  requestTotal('day', (res) => {
    window.ytData.dayTotalCategory = res.data;
    document.querySelector('#top-stats-day').innerHTML = secondsToHms(
      res.data.time
    );
  });

  requestTotal('week', (res) => {
    window.ytData.weekTotalCategory = res.data;
    document.querySelector('#top-stats-week').innerHTML = secondsToHms(
      res.data.time
    );
  });

  requestTotal('month', (res) => {
    window.ytData.monthTotalCategory = res.data;
    document.querySelector('#top-stats-month').innerHTML = secondsToHms(
      res.data.time
    );
    callback();
  });
}
