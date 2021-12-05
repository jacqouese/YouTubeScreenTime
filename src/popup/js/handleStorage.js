chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    document.querySelector('#cat').innerHTML = `${(
        request.subject / 60
    ).toFixed(1)}h`;
});

let watchedCategory = null;

chrome.storage.local.get(['currentCategory'], (result) => {
    watchedCategory = result.currentCategory;
});
