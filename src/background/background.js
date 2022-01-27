import { addRestriction } from './db/addRestriction';
import { checkForRestriction } from './db/checkForRestriction';
import { checkTimeRemainingForCategory } from './db/checkTimeRemainingForCategory';
import { deleteRestriction } from './db/deleteRestriction';
import { getAllRestrictions } from './db/getAllRestrictions';
import { getAllWatched } from './db/getAllWatched';
import { handleDB } from './db/handleDB';
import { queryDB } from './db/queryDB';
import { sendMessage } from './message/sendMessage';

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
    handleDB(
      request.body.category,
      request.body.date,
      request.body.time,
      () => {
        getAllWatched('day', (res) => {
          checkTimeRemainingForCategory(
            request.body.category,
            res.categoryObject[request.body.category],
            'day',
            (isTimeLeft, timeRemaining) => {
              sendResponse({
                status: 200,
                data: {
                  isTimeLeft: isTimeLeft,
                  timeRemaining: timeRemaining,
                },
              });
            }
          );
        });
      }
    );
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
  } else if (request.type === 'addRestriction') {
    checkForRestriction(
      request.body.restriction,
      () => {
        console.log('here');
        addRestriction(request.body.restriction, request.body.time);
        sendResponse({
          status: 200,
          data: {
            ok: 'ok',
          },
        });
      },
      () => {
        console.log('here');
        sendResponse({
          status: 403,
          error: 'restriction for this category already exists',
        });
      }
    );
  } else if (request.type === 'getAllRestrictions') {
    getAllRestrictions((res) => {
      sendResponse({
        status: 200,
        data: {
          restrictions: res,
        },
      });
    });
  } else if (request.type === 'deleteRestriction') {
    deleteRestriction(request.body.restriction);
    sendResponse({
      status: 200,
    });
  } else if (request.type === 'setUserSettings') {
    localStorage.setItem(request.body.settingName, request.body.settingValue);
    sendResponse({
      status: 201,
      message: 'setting added successfully',
    });
  } else if (request.type === 'getUserSettings') {
    const setting = localStorage.getItem(request.body.settingName);

    if (setting === null) {
      localStorage.setItem(request.body.settingName, false);
    }

    sendResponse({
      status: 200,
      data: {
        settingName: request.body.settingName,
        settingValue: setting,
      },
    });
  } else {
    sendResponse({
      status: 404,
      error: `request type invalid: "${request.type}"`,
    });
  }
  return true; // prevent closed connection error
});

// send message to tab when its URL changes
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo && changeInfo.status == 'complete') {
    console.log('Tab updated: ');
    chrome.tabs.sendMessage(tabId, { type: 'newURL' });
  }
});
