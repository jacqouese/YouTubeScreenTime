function saveToStorage(timer) {
  // get total time from storage
  chrome.storage.sync.get(['category'], (result) => {
    console.log('progress has been saved');

    // append current session time to total time
    const total = timer.time + result.category;

    // set total time to storage
    chrome.storage.sync.set({ category: total });
    timer.time = 0;
  });
}

export function videoSaveProgress(video, timer) {
  document.addEventListener('transitionend', () => {
    // pause timer if no video detected
    if (video.src === '') {
      if (timer.isResumed === true) {
        timer.pause();

        saveToStorage(timer);
      }
    }
  });

  window.onbeforeunload = () => {
    saveToStorage(timer);

    return 'you sure?';
  };
}
