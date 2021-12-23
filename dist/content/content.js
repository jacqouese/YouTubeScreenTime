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

  function checkCategory() {
    // retrive video category
    const categoryScript = document.getElementById('scriptTag');
    if (!categoryScript) return;
    console.log(JSON.parse(categoryScript.innerHTML)['genre']);
    return JSON.parse(categoryScript.innerHTML)['genre'];
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

  function getDate() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    return date;
  }

  function sendToDB(time, date, category) {
    chrome.runtime.sendMessage({
      for: 'background',
      type: 'saveRequest',
      videoSave: {
        time: time,
        date: date,
        category: category
      }
    });
  }

  function videoSaveProgress(video, timer, category) {
    document.addEventListener('transitionend', () => {
      // pause timer if no video detected
      if (video.src === '') {
        if (timer.isResumed === true) {
          timer.pause();
          console.log('progress saved under', checkCategory());
          sendToDB(timer.time, getDate(), checkCategory());
          timer.time = 0;
        }
      }
    });
    chrome.runtime.onMessage.addListener(() => {
      if (timer.time != 0) {
        console.log('progress saved under', checkCategory());
        sendToDB(timer.time, getDate(), checkCategory());
        timer.time = 0;
      }
    });

    window.onbeforeunload = () => {
      console.log('progress saved under', checkCategory());
      sendToDB(timer.time, getDate(), checkCategory());
      timer.time = 0;
      return 'you sure?';
    };
  }

  const video = document.getElementsByTagName('video')[0] || null;
  const hook = document.querySelector('#count');

  if (video !== null) {
    // get category from YouTube
    chrome.storage.sync.set({
      currentCategory: checkCategory()
    }); // interval with play/pause ability

    const timer = new intervalTimer(() => {
      console.log(timer.time++);
    }, 1000); // listen for URL change to update category

    chrome.runtime.onMessage.addListener(() => {
      console.log('url change');
    }); // listen for play / pause

    videoListeners(video, timer); // save time when user exits

    videoSaveProgress(video, timer, checkCategory());
  } else {
    console.log('no video');
  }

})));
