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
    const categoryScript = document.getElementById('scriptTag');
    if (!categoryScript) return null;
    const parsedCategory = JSON.parse(categoryScript.innerHTML)['genre'];
    return parsedCategory;
  }

  function isVideoLoaded() {
    return document.querySelector(`ytd-watch-flexy[video-id]`) || null;
  }
  function cLog(value) {
    console.log(value);
  }

  function videoListeners(video, timer) {
    video.addEventListener('playing', () => {
      // prevent starting multiple timeouts
      console.log('video is playing');

      if (timer.isResumed === false) {
        cLog('resumed');
        timer.resume();
      }
    }); // makes timer not start if video is opened in a new tab

    if (video.readyState > 2) {
      if (timer.isResumed === false) {
        cLog('resumed');
        timer.resume();
      }
    }

    video.addEventListener('pause', () => {
      timer.pause();
      cLog('paused');
    });
  }

  const globalState = {};
  const setState = (state, value) => {
    if (state in globalState) {
      globalState[state].setState(value);
    } else {
      globalState[state] = {
        state: value,
        subscribers: [],

        setState(state) {
          this.state = state;
          this.subscribers.forEach(elem => {
            elem();
          });
        }

      };
    }
  };

  function checkTimeRemaining(category) {
    chrome.runtime.sendMessage({
      for: 'background',
      type: 'restrictions/timeremaining',
      body: {
        category: category,
        timeframe: 'day'
      }
    }, res => {
      if (res.data.timeRemaining === null) return cLog(`no restrictions found: ${category}`);
      cLog(`${res.data.timeRemaining} seconds left`); // user paused notifications

      if (window.ytData.settings.disableNotifications == 'true') return;

      if (res.data.timeRemaining <= 0) {
        if (globalState.hasShownNotification.state === true) return;
        setState('hasShownNotification', true);
        return mainNotification.createNoTimeNotification(res.data.ifSpecific ? category : 'today');
      }

      if (res.data.timeRemaining < 300 && window.ytData.settings.lowTimeNotifications == 'true') {
        if (globalState.hasShownWarning.state === true) return;
        setState('hasShownWarning', true);
        return mainNotification.createLowTimeNotification(res.data.ifSpecific ? category : 'today');
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
      type: 'watchtime/create',
      body: {
        time: time,
        date: date,
        category: category
      }
    }, res => {// console.log(`${res.data.timeRemaining} seconds left`);
      // if (res.data.isTimeLeft === false) {
      //     mainNotification.createNoTimeNotification(category);
      // } else if (
      //     res.data.timeRemaining !== null &&
      //     res.data.timeRemaining < 300
      // ) {
      //     if (window.ytData.settings.lowTimeNotifications == 'true') {
      //         mainNotification.createLowTimeNotification(category);
      //     }
      // }
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
        setState('hasShownNotification', false);

        if (window.ytData.settings.displayCategory == 'true') ;
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
      }
    };
  }

  // listen for first video after opening YouTube
  function listenForFirstVideo(callback) {
    chrome.runtime.onMessage.addListener(function listenForFirstVideoInner() {
      let video = document.getElementsByTagName('video')[0] || null; // when the video has been found, remove listener and run callback

      if (video !== null) {
        const correctVideoTag = document.getElementsByTagName('video')[document.getElementsByTagName('video').length - 1];
        chrome.runtime.onMessage.removeListener(listenForFirstVideoInner);
        callback(correctVideoTag);
      }
    });
  }

  function listenForSettingChanges() {
    window.ytData = {};
    window.ytData.settings = {}; // get settings after launching

    function getUserSettings(settingName, callback) {
      chrome.extension.sendMessage({
        type: 'settings/get',
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
    getUserSettings('disableNotifications', res => {
      window.ytData.settings.disableNotifications = res.data.settingValue;
    });
    getUserSettings('focusMode', res => {
      window.ytData.settings.focusMode = res.data.settingValue;
    });
    getUserSettings('isExtensionPaused', res => {
      window.ytData.settings.isExtensionPaused = res.data.settingValue;
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('got message', request);

      if (request.type === 'settingChange') {
        window.ytData.settings[request.body.settingName] = request.body.settingValue;
      }

      if (request.type === 'newURL') {
        setTimeout(() => {
          if (window.ytData.settings.displayCategory == 'true') {
            injectCategoryString();
          }
        }, 1000);
      }
    });
  }

  function notificationService() {
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
    };

    this.createNoTimeNotification = category => {
      this.createSimpleNotification(`Time for ${category} has run out`, `The time limit you set for ${category} has run out. Check YouTube ScreenTime extension for more details.`);
    };

    this.createLowTimeNotification = category => {
      this.createSimpleNotification(`Less than 5 min for ${category}`, `The time limit you set for ${category} has almost run out.`);
    };
  }

  function checkIfCanWatchInFocus(category, callback) {
    chrome.runtime.sendMessage({
      for: 'background',
      type: 'whitelist/check',
      body: {
        category: category
      }
    }, res => {
      if (res.data.canWatch === true) return callback(true);
      return callback(false);
    });
  }

  class redirectService {
    static redirectToFocusPage() {
      const mainContainer = document.createElement('div');
      mainContainer.className = 'ytt-redirected-container';
      const mainText = document.createElement('h1');
      mainText.textContent = "You're not allowed to watch this video in Focus Mode";
      const subText = document.createElement('h2');
      subText.textContent = 'check YouTube ScreenTime extension for more information';
      const button = document.createElement('button');
      button.textContent = 'Go to homepage';

      button.onclick = () => window.location.href = 'https://www.youtube.com';

      mainContainer.appendChild(mainText);
      mainContainer.appendChild(subText);
      mainContainer.appendChild(button);
      document.querySelector('#columns').innerHTML = '';
      document.querySelector('#columns').appendChild(mainContainer);
    }

  }

  let video = document.getElementsByTagName('video')[-1] || null;
  const hook = document.querySelector('#count');
  listenForSettingChanges();
  listenForFirstVideo(foundVideo => {
    if (window.ytData.settings.isExtensionPaused == 'true') return;
    cLog('video found');
    video = foundVideo; // initialize notification

    globalThis.mainNotification = new notificationService(); // get category from YouTube

    chrome.storage.sync.set({
      currentCategory: checkCategory()
    });

    if (window.ytData.settings.displayCategory == 'true') {
      let pageLoadInterval = null;

      const waitUntilPageLoaded = () => {
        if (isVideoLoaded() === null || video.readyState < 2) return;
        clearInterval(pageLoadInterval);
        pageLoadInterval = null;
        injectCategoryString();
      };

      pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
    }

    setState('hasShownNotification', false);
    setState('hasShownWarning', false); // interval with play / pause ability

    const timer = new intervalTimer(() => {
      cLog(timer.time++); // autosave every 60 seconds

      if (timer.time === 60) {
        sendToDB(timer.time, getDate(), checkCategory());
        timer.time = 0;
      }

      if (timer.time === 2) {
        checkTimeRemaining(checkCategory());

        if (window.ytData.settings.focusMode == 'true') {
          checkIfCanWatchInFocus(checkCategory(), res => {
            if (res === false) redirectService.redirectToFocusPage();
          });
        }
      }
    }, 1000);
    timer.pause(); // listen for play / pause

    videoListeners(video, timer); // listen when to save progress to database

    videoSaveProgressListener(video, timer, checkCategory());
  });

})));
