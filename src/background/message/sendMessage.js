export function sendMessage(type, body) {
  chrome.extension.sendMessage({ type: type, body }, function (response) {
    console.log(response);
  });
}
