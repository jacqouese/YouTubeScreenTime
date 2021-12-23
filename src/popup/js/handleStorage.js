chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  document.querySelector('#cat').innerHTML = `${(request.subject / 60).toFixed(
    1
  )}h`;
});

let watchedCategory = null;

chrome.storage.sync.get(['currentCategory'], (result) => {
  watchedCategory = result.currentCategory;

  console.log(watchedCategory);
});

chrome.storage.sync.get(['category'], (result) => {
  category = result.category;

  console.log(result);

  document.querySelector('#cat').innerHTML = `${(category / 60).toFixed(2)}h`;
});
