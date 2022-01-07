import { getAllWatched } from './db/getAllWatched';
import { handleDB } from './db/handleDB';
import { queryDB } from './db/queryDB';
import { sendMessage } from './message/sendMessage';

console.log('bg');

// handle listening for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  );

  console.log(request);

  // save time from content
  if (request.type === 'saveRequest') {
    // adds new entry to watch time log
    handleDB(request.body.category, request.body.date, request.body.time);
  } else if (request.type === 'dataRequest') {
    // watch time data request from popup
    if (request.body.period === 'day') {
      getAllWatched('day', (res) => {
        sendResponse({
          status: 200,
          data: {
            time: res.totalTime,
            categoryObject: res.categoryObject,
            dateObject: res.dateObject,
          },
        });
      });
    } else if (request.body.period === 'week') {
      getAllWatched('week', (res) => {
        sendResponse({
          status: 200,
          data: {
            time: res.totalTime,
            categoryObject: res.categoryObject,
            dateObject: res.dateObject,
          },
        });
      });
    } else if (request.body.period === 'month') {
      getAllWatched('month', (res) => {
        sendResponse({
          status: 200,
          data: {
            time: res.totalTime,
            categoryObject: res.categoryObject,
            dateObject: res.dateObject,
          },
        });
      });
    } else {
      sendResponse({
        status: 404,
        error: `period invalid or not given: ${request.body.period}`,
      });
    }
  } else if (request.type === 'saveRestriction') {
    console.log('restriction save requested');
  } else if (request.type === 'getRestriction') {
    console.log('restriction requested');
  } else {
    sendResponse({
      status: 404,
      error: `request type invalid: "${request.type}"`,
    });
  }
  return true; // prevent closed connection error
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo && changeInfo.status == 'complete') {
    console.log('Tab updated: ');
    chrome.tabs.sendMessage(tabId, { data: 'new url' });
  }
});
