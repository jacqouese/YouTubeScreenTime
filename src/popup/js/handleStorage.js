chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
});

function requestDayTotal() {
  chrome.extension.sendMessage(
    { type: 'dataRequest', body: { period: 'day', category: 'all' } },
    function (response) {
      document.querySelector('#cat').innerHTML = secondsToHms(
        response.data.time
      );
    }
  );
}

requestDayTotal();
