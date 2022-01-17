export function listenForNewURL(callback) {
  chrome.runtime.onMessage.addListener(function listenForNewURLInner() {
    callback();
  });
}
