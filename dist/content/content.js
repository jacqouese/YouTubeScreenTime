(function (factory) {
  typeof define === 'function' && define.amd ? define('content', factory) :
  factory();
}((function () { 'use strict';

  function intervalTimer(callback, delay) {
    var timerId,
        start,
        remaining = delay;
    this.isResumed = false;
    this.time = 0;

    this.pause = function () {
      this.isResumed = false;
      window.clearTimeout(timerId);
      remaining -= new Date() - start;
    }; // resume loop automatically


    var resumeLoop = function () {
      start = new Date();
      timerId = window.setTimeout(function () {
        remaining = delay;
        resumeLoop();
        callback();
      }, remaining);
    };

    this.resume = function () {
      this.isResumed = true;
      resumeLoop();
    };

    this.isResumed = true;
    resumeLoop();
  }

  function injectCategory() {
    // get video category by injecting JS
    const injectedCode = `
        const yttDiv = document.createElement('div');
        yttDiv.id = 'ytt-category'
        yttDiv.style.display = 'hidden';
        yttDiv.innerHTML =
            ytInitialPlayerResponse.microformat.playerMicroformatRenderer.category;

        document.body.appendChild(yttDiv);
      `;
    var script = document.createElement('script');
    script.textContent = injectedCode;
    document.head.appendChild(script);
  }
  function checkCategory() {
    // retrive video category
    const category = document.querySelector('#ytt-category').innerHTML;
    return category;
  }

  function videoListeners(video, timer) {
    video.addEventListener('playing', () => {
      // prevent starting multiple timeouts
      if (timer.isResumed === false) {
        console.log('resumed');
        timer.resume();
      }
    });
    video.addEventListener('pause', () => {
      timer.pause();
      console.log('paused');
    });
  }

  function saveToStorage(timer) {
    // get total time from storage
    chrome.storage.sync.get(['category'], result => {
      console.log('progress has been saved'); // append current session time to total time

      const total = timer.time + result.category; // set total time to storage

      chrome.storage.sync.set({
        category: total
      });
      timer.time = 0;
    });
  }

  function videoSaveProgress(video, timer) {
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

  const video = document.getElementsByTagName('video')[0] || null;
  const hook = document.querySelector('#count');

  if (video !== null) {
    // get category from YouTube
    injectCategory();
    console.log(checkCategory());
    chrome.storage.sync.set({
      currentCategory: checkCategory()
    });

    const timer = new intervalTimer(() => {
      console.log(timer.time++);
    }, 1000); // listen for play / pause

    videoListeners(video, timer); // save time when user exits

    videoSaveProgress(video, timer);
  } else {
    console.log('no video');
  }

})));
