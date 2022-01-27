import { requestTotal } from './requestTotal';
import { secondsToHms } from '../helpers/secondsToHms';
import { requestAllRestricions } from './requestAllRestrictions';
import { getUserSettings } from './getUserSettings';

export function loadData(callback) {
  // initialize global object
  window.ytData = {};
  window.ytData.settings = {};

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

  requestAllRestricions((res) => {
    window.ytData.allRestrictions = res.data.restrictions;
  });

  // load settings
  getUserSettings('displayCategory', (res) => {
    window.ytData.settings.displayCategory = res.data.settingValue;
  });
  getUserSettings('lowTimeNotifications', (res) => {
    window.ytData.settings.lowTimeNotifications = res.data.settingValue;
  });
  getUserSettings('warnOnly', (res) => {
    window.ytData.settings.warnOnly = res.data.settingValue;
  });
  getUserSettings('isDark', (res) => {
    window.ytData.settings.isDark = res.data.settingValue;

    if (res.data.settingValue == 'true') {
      document.body.classList.add('dark');
    }
  });
  getUserSettings('isExtensionPaused', (res) => {
    window.ytData.settings.isExtensionPaused = res.data.settingValue;
  });
}
