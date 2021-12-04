chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    document.querySelector('#cat').innerHTML = `${request.subject}h`;
});

chrome.storage.local.get(['currentCategory'], (result) => {
    console.log(result.currentCategory);
});
