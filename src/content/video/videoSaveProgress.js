export function videoSaveProgress(video, timer, time) {
  document.addEventListener('transitionend', () => {
    // pause timer if no video detected
    if (video.src === '') {
      if (timer.isResumed === true) {
        timer.pause();

        chrome.storage.local.get(['category'], (result) => {
          category = result.category;
          console.log('total time');

          timer.time = 0;
        });

        chrome.storage.local.set({ category: 600 });

        console.log('paused cuz no video, progress saved');
      }
    }
  });

  window.onbeforeunload = () => {
    console.log('exited, progress saved');
    timer.time = 0;

    return 'you sure?';
  };
}
