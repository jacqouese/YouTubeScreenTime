function runOnPageChange(callback) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'newURL') {
            callback();
        }
    });
}

export default runOnPageChange;
