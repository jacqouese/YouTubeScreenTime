export function deleteRestriction(restriction, callback) {
  chrome.extension.sendMessage(
    {
      type: 'deleteRestriction',
      body: { restriction: restriction },
    },
    function (res) {
      if (res.status !== 200) return console.warn('Some error occured');

      callback();
    }
  );
}
