import { requestTotal } from './requestTotal';
import { secondsToHms } from '../helpers/secondsToHms';
import { requestAllRestricions } from './requestAllRestrictions';
import { getUserSettings } from './getUserSettings';
import { globalState, setState, updater } from '../state/state';
import { dataRequest } from '../services/dataRequest';

export function loadData(callback) {
    // initialize global object
    window.ytData = {};
    window.ytData.settings = {};

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'settingChange') {
            window.ytData[request.body.settingName] = request.body.settingValue;

            // dark mode
            if (request.body.settingName === 'isDark') {
                if (request.body.settingValue == true) {
                    document.body.classList.add('dark');
                } else {
                    document.body.classList.remove('dark');
                }
            }
        }
    });

    // request total for each period
    dataRequest.call({ type: 'watchtime/get', body: { period: 'day', category: 'all' } }, (res) => {
        window.ytData.dayTotalCategory = res.data;
        document.querySelector('#top-stats-day').innerHTML = secondsToHms(res.data.time);
        const percent = document.querySelector('#top-stats-day-percent');
        percent.innerHTML = res.data.percentChange + '%';
        if (res.data.percentChange < 0) percent.classList.add('percent-down');
    });

    dataRequest.call({ type: 'watchtime/get', body: { period: 'week', category: 'all' } }, (res) => {
        window.ytData.weekTotalCategory = res.data;
        document.querySelector('#top-stats-week').innerHTML = secondsToHms(res.data.time);
        const percent = document.querySelector('#top-stats-week-percent');
        percent.innerHTML = res.data.percentChange + '%';
        if (res.data.percentChange < 0) percent.classList.add('percent-down');
    });

    dataRequest.call({ type: 'watchtime/get', body: { period: 'month', category: 'all' } }, (res) => {
        window.ytData.monthTotalCategory = res.data;
        document.querySelector('#top-stats-month').innerHTML = secondsToHms(res.data.time);
        const percent = document.querySelector('#top-stats-month-percent');
        percent.innerHTML = res.data.percentChange + '%';
        if (res.data.percentChange < 0) percent.classList.add('percent-down');
        callback();
    });

    dataRequest.call({ type: 'restriction/get' }, (res) => {
        window.ytData.allRestrictions = res.data.restrictions;
        globalState.restrictedItems.setState(res.data.restrictions);
    });

    dataRequest.call({ type: 'whitelist/get' }, (res) => {
        window.ytData.whitelistedItems = res.data.whitelist;
        globalState.whitelistedItems.setState(res.data.whitelist);
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

    getUserSettings('hideSuggestions', (res) => {
        window.ytData.settings.hideSuggestions = res.data.settingValue;
    });

    getUserSettings('redirectHomepage', (res) => {
        window.ytData.settings.redirectHomepage = res.data.settingValue;
    });

    getUserSettings('focusMode', (res) => {
        window.ytData.settings.focusMode = res.data.settingValue;
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
