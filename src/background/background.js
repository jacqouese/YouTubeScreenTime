import { routes } from './route';
import router from './router';

// handle listening for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(
        sender.tab
            ? 'from a content script:' + sender.tab.url
            : 'from the extension'
    );

    console.log(request);
    router(request, sendResponse);

    try {
        routes[request.type]();
    } catch (e) {
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
