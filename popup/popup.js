console.log('popup');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request, sender);
    document.querySelector('#cat').innerHTML = request.subject;
});
