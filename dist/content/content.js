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

  function checkTimeRemaining(category) {
    chrome.runtime.sendMessage({
      for: 'background',
      type: 'checkTimeRemaining',
      body: {
        category: category,
        timeframe: 'day'
      }
    }, res => {
      console.log(`${res.data.timeRemaining} seconds left`);

      if (res.data.isTimeLeft === false) {
        console.log('%cRestriction trigger!!!', 'color: red');
        mainNotification.createSimpleNotification(`Time for ${category} has run out`, `The time limit you set for ${category} has run out. Check YouTube ScreenTime extension for more details.`);
      } else if (res.data.timeRemaining !== null && res.data.timeRemaining < 300) {
        mainNotification.createSimpleNotification(`Less than 5 min for ${category}`, `The time limit you set for ${category} has almost run out.`);
      }
    });
  }

  function getDate() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    return date;
  }

  function injectCategoryString() {
    const elem = document.querySelector('#info-strings') || null;
    if (elem === null) return;
    const dot = document.createElement('span');
    dot.id = 'dot';
    dot.classList.add('style-scope');
    dot.classList.add('ytd-video-primary-info-renderer');
    var span = elem.querySelector('.ytt-cateogry') || null;

    if (span === null) {
      span = document.createElement('span');
      span.classList.add('ytt-cateogry');
      elem.appendChild(dot);
      elem.appendChild(span);
    }

    span.textContent = `${checkCategory()}`;
  }

  function sendToDB(time, date, category) {
    if (category === undefined || time === 0) return;
    console.log('progress saved under', category);
    chrome.runtime.sendMessage({
      for: 'background',
      type: 'saveRequest',
      body: {
        time: time,
        date: date,
        category: category
      }
    }, res => {
      console.log(`${res.data.timeRemaining} seconds left`);

      if (res.data.isTimeLeft === false) {
        console.log('%cRestriction trigger!!!', 'color: red');
        mainNotification.createSimpleNotification(`Time for ${category} has run out`, `The time limit you set for ${category} has run out. Check YouTube ScreenTime extension for more details.`);
      } else if (res.data.timeRemaining !== null && res.data.timeRemaining < 300) {
        if (window.ytData.settings.lowTimeNotifications == 'true') {
          mainNotification.createSimpleNotification(`Less than 5 min for ${category}`, `The time limit you set for ${category} has almost run out.`);
        }
      }
    });
  }
  function videoSaveProgressListener(video, timer, category) {
    document.addEventListener('transitionend', () => {
      // pause timer if no video detected
      if (video.src === '') {
        if (timer.isResumed === true) {
          timer.pause();
          sendToDB(timer.time, getDate(), checkCategory());
          timer.time = 0;
        }
      }
    }); // when url changes

    chrome.runtime.onMessage.addListener(req => {
      if (req.type === 'newURL') {
        if (window.ytData.settings.displayCategory == 'true') {
          setTimeout(() => {
            injectCategoryString();
          }, 1000);
        }
      }

      if (req.type === 'newURL' && timer.time != 0) {
        sendToDB(timer.time, getDate(), checkCategory());
        timer.time = 0;
        timer.pause();
      }
    }); // when user closes tab

    window.onbeforeunload = () => {
      if (timer.time != 0) {
        sendToDB(timer.time, getDate(), checkCategory());
        timer.time = 0;
        return 'you sure?';
      }
    };
  }

  // listen for first video after opening YouTube
  function listenForFirstVideo(callback) {
    chrome.runtime.onMessage.addListener(function listenForFirstVideoInner() {
      const video = document.getElementsByTagName('video')[0] || null; // when the video has been found, remove listener and run callback

      if (video !== null) {
        chrome.runtime.onMessage.removeListener(listenForFirstVideoInner);
        console.log('video found');
        callback(video);
      }
    });
  }

  function notification() {
    const mainContainer = document.createElement('div');
    mainContainer.id = 'ytt-notification-contianer';
    document.body.appendChild(mainContainer);

    this.dismissNotificationById = id => {
      const notificationElem = document.querySelector(`#${id}`);
      notificationElem.parentNode.removeChild(notificationElem);
    };

    this.createSimpleNotification = (title, subtitle) => {
      const simpleNotification = document.createElement('div');
      simpleNotification.classList.add('ytt-simple-notification');
      const notificationId = `ytt-element-${Math.floor(Math.random() * 99999)}`;
      simpleNotification.id = notificationId;
      mainContainer.appendChild(simpleNotification);
      const imgURL = chrome.extension.getURL('content/logo.png');
      const html = `
    <div class="flex">
        <img src="${imgURL}" alt="">
        <h1>${title}</h1>
    </div>
    <p>${subtitle}</p>
    `;
      const button = document.createElement('button');
      button.textContent = 'Dismiss';
      button.addEventListener('click', () => {
        const idElem = document.getElementById(notificationId);
        idElem.parentNode.removeChild(idElem);
      });
      simpleNotification.innerHTML = html;
      simpleNotification.appendChild(button);
      setTimeout(() => {
        this.dismissNotificationById(notificationId);
      }, 10000);
    };
  }

  function listenForSettingChanges() {
    window.ytData = {};
    window.ytData.settings = {}; // get settings after launching

    function getUserSettings(settingName, callback) {
      chrome.extension.sendMessage({
        type: 'getUserSettings',
        body: {
          settingName: settingName
        }
      }, res => {
        if (res.status !== 200 && res.status !== 201 || !res.status) return console.warn('something went wrong!', res.status);
        callback(res);
      });
    }

    getUserSettings('displayCategory', res => {
      window.ytData.settings.displayCategory = res.data.settingValue;
    });
    getUserSettings('lowTimeNotifications', res => {
      window.ytData.settings.lowTimeNotifications = res.data.settingValue;
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      window.ytData.settings[request.body.settingName] = request.body.settingValue;
    });
  }

  let video = document.getElementsByTagName('video')[0] || null;
  const hook = document.querySelector('#count');
  listenForFirstVideo(foundVideo => {
    console.log('video found');
    video = foundVideo; // initialize notification

    globalThis.mainNotification = new notification(); // get category from YouTube

    chrome.storage.sync.set({
      currentCategory: checkCategory()
    }); // get settings from popup

    listenForSettingChanges(); // interval with play / pause ability

    const timer = new intervalTimer(() => {
      console.log(timer.time++); // autosave every 60 seconds

      if (timer.time === 60) {
        sendToDB(timer.time, getDate(), checkCategory());
        timer.time = 0;
      }
    }, 1000); // listen for play / pause

    videoListeners(video, timer); // listen when to save progress to database

    videoSaveProgressListener(video, timer, checkCategory());

    window.onfocus = () => {
      setTimeout(() => {
        if (window.ytData.settings.displayCategory == 'true') {
          injectCategoryString();
        }

        const videoCategory = checkCategory();

        if (window.ytData.settings.lowTimeNotifications == 'true') {
          checkTimeRemaining(videoCategory);
        }
      }, 1000);
    };
  });

})));
