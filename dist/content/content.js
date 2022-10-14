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

  function isVideoLoaded() {
    return document.querySelector(`ytd-watch-flexy[video-id]`) || null;
  }
  function cLog(value1, value2) {
    if (value2) return console.log('[yt-d]', value1, value2);
    console.log('[yt-d]', value1);
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

  function getDate() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    return date;
  }

  class VideoCategoryService {
    static injectCodeForExtractingCategory(category) {
      // get video category by injecting JS
      setTimeout(() => {
        console.log(JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'], 'fromext');
      }, 5000);
      const injectedCode = `
            setTimeout(() => {
              if (document.querySelector('#ytt-category')) {
                if (JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'] !== ${category}) {
                  console.log(JSON.parse(document.getElementById('scriptTag').innerHTML)['genre']);
                  document.querySelector('#ytt-category').innerHTML = JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'];
                }
              }
              else {
                const yttDiv = document.createElement('div');
                    yttDiv.id = 'ytt-category'
                    yttDiv.style.display = 'hidden';
                    yttDiv.innerHTML =
                      JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'];
    
                    document.body.appendChild(yttDiv);
              }
            }, 2000); 
          `;
      var previousScript = document.querySelector('.ytt-script');

      if (previousScript) {
        previousScript.parentNode.removeChild(previousScript);
      }

      var script = document.createElement('script');
      script.textContent = injectedCode;
      script.classList.add('ytt-script');
      script.setAttribute('defer', '');
      document.body.appendChild(script);
    }

    static checkCurrentlyWatchedVideoCategory() {
      const categoryScript = document.getElementById('scriptTag');
      if (!categoryScript) return null;
      const parsedCategory = JSON.parse(categoryScript.innerHTML)['genre'];
      return parsedCategory;
    }

    static injectCategoryStringIntoYouTubePage() {
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

      const currentCategory = this.checkCurrentlyWatchedVideoCategory();
      span.textContent = `${currentCategory}`;
    }

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
  function videoSaveProgressListener(video, timer) {
    document.addEventListener('transitionend', () => {
      // pause timer if no video detected
      if (video.src === '') {
        if (timer.isResumed === true) {
          timer.pause();
          sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
          timer.time = 0;
        }
      }
    }); // when url changes

    chrome.runtime.onMessage.addListener(req => {
      if (req.type === 'newURL') {
        setState('hasShownNotification', false);
      }

      if (req.type === 'newURL' && timer.time != 0) {
        sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
        timer.time = 0;
        timer.pause();
      }
    }); // when user closes tab

    window.onbeforeunload = () => {
      if (timer.time != 0) {
        sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
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

  function getHrefSubpage() {
    const href = window.location.href;
    let subpage = href.split('www.youtube.com')[1];
    subpage = subpage.split('?')[0];
    return subpage;
  }

  function waitForElementLoad(element, callback) {
    let iterator = 0;
    let pageLoadInterval = null;
    const elementName = element;

    const waitUntilPageLoaded = () => {
      cLog('waiting for element load', element);
      iterator += 1;

      if (iterator > 20) {
        console.error('[yt-d]', `Waiting for element ${element} exceeded max time`);
        return clearInterval(pageLoadInterval);
      }

      const elementObj = document.querySelector(elementName);
      if (elementObj === null) return;
      clearInterval(pageLoadInterval);
      pageLoadInterval = null;
      callback(elementObj);
    };

    pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
  }

  class FocusModeService {
    hideDistractions() {
      console.log('Hide distrations - current page:', getHrefSubpage());

      if (getHrefSubpage() === '/') {
        waitForElementLoad('ytd-two-column-browse-results-renderer', element => {
          element.remove();
        });
      }

      if (getHrefSubpage() === '/watch') {
        waitForElementLoad('#related', element => {
          element.innerHTML = '';
          element.id = 'ytd-hide-suggestions';
        });
      }
    }

  }

  function listenForSettingChanges(callback) {
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
    getUserSettings('hideSuggestions', res => {
      window.ytData.settings.hideSuggestions = res.data.settingValue;
    });
    getUserSettings('redirectHomepage', res => {
      window.ytData.settings.redirectHomepage = res.data.settingValue;
    });
    getUserSettings('isExtensionPaused', res => {
      window.ytData.settings.isExtensionPaused = res.data.settingValue;
      callback();
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('got message', request);

      if (request.type === 'settingChange') {
        window.ytData.settings[request.body.settingName] = request.body.settingValue;
        callback();
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
      mainContainer.id = 'ytt-redirected-container';
      const mainText = document.createElement('h1');
      mainText.textContent = "You're not allowed to watch this video in Focus Mode";
      const subText = document.createElement('p');
      subText.textContent = 'check YouTube ScreenTime extension for more information';
      const button = document.createElement('button');
      button.textContent = 'Go to homepage';

      button.onclick = () => window.location.href = 'https://www.youtube.com';

      mainContainer.appendChild(mainText);
      mainContainer.appendChild(subText);
      mainContainer.appendChild(button);
      document.querySelector('body').innerHTML = '';
      document.querySelector('body').appendChild(mainContainer);
    }

  }

  function runOnPageChange(callback) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'newURL') {
        callback();
      }
    });
  }

  waitForElementLoad('body', () => {
    let video = document.getElementsByTagName('video')[-1] || null;
    const focusObject = new FocusModeService();
    listenForSettingChanges(() => {
      if (getHrefSubpage() === '/') {
        if (window.ytData.settings.redirectHomepage == 'true') {
          location.replace('https://www.youtube.com/feed/subscriptions');
        }
      }

      if (getHrefSubpage() === '/' || getHrefSubpage() === '/watch') {
        if (window.ytData.settings.hideSuggestions == 'true') focusObject.hideDistractions();
      }
    });
    runOnPageChange(() => {
      if (getHrefSubpage() === '/') {
        if (window.ytData.settings.redirectHomepage == 'true') {
          location.replace('https://www.youtube.com/feed/subscriptions');
        }
      }

      if (getHrefSubpage() === '/' || getHrefSubpage() === '/watch') {
        if (window.ytData.settings.hideSuggestions == 'true') focusObject.hideDistractions();
      }
    });
    listenForFirstVideo(foundVideo => {
      if (window.ytData.settings.isExtensionPaused == 'true') return;
      video = foundVideo; // initialize notification

      globalThis.mainNotification = new notificationService(); // get category from YouTube

      chrome.storage.sync.set({
        currentCategory: VideoCategoryService.checkCurrentlyWatchedVideoCategory()
      });

      if (window.ytData.settings.displayCategory == 'true') {
        let pageLoadInterval = null;

        const waitUntilPageLoaded = () => {
          if (isVideoLoaded() === null || video.readyState < 2) return;
          clearInterval(pageLoadInterval);
          pageLoadInterval = null;
          VideoCategoryService.injectCategoryStringIntoYouTubePage();
        };

        pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
      }

      setState('hasShownNotification', false);
      setState('hasShownWarning', false); // interval with play / pause ability

      const timer = new intervalTimer(() => {
        cLog(timer.time++); // autosave every 60 seconds

        if (timer.time === 60) {
          sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
          timer.time = 0;
        }

        if (timer.time === 1) {
          if (window.ytData.settings.focusMode == 'true') {
            checkIfCanWatchInFocus(VideoCategoryService.checkCurrentlyWatchedVideoCategory(), res => {
              if (res === false) {
                redirectService.redirectToFocusPage();
                video.pause();
              }
            });
          }
        }

        if (timer.time === 2) {
          checkTimeRemaining(VideoCategoryService.checkCurrentlyWatchedVideoCategory());
        }
      }, 1000);
      timer.pause(); // listen for play / pause

      videoListeners(video, timer); // listen when to save progress to database

      videoSaveProgressListener(video, timer);
    });
  });

})));
