import { handleDB } from './db/handleDB';
import { queryDB } from './db/queryDB';
import { sendMessage } from './message/sendMessage';

console.log('bg');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  );

  console.log(request);

  if (request.type === 'saveRequest') {
    handleDB(
      request.videoSave.category,
      request.videoSave.date,
      request.videoSave.time
    );
  }
  if (request.type === 'dataRequest') {
    queryDB((res) => {
      sendResponse({
        data: {
          day: '2020-10-10',
          time: res,
        },
      });
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
