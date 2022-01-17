import { intervalTimer } from './helpers/intervalTimer';

import { listenForNewURL } from './api/listenForNewURL';
import { injectCategory, checkCategory } from './category/extractCategory';
import { videoListeners } from './video/videoListeners';
import { videoSaveProgressListener } from './video/videoSaveProgressListener';
import { listenForFirstVideo } from './api/listenForFirstVideo';
import { notification } from './notifications/notification';
import { injectCategoryString } from './inject/injectCategoryString';

let video = document.getElementsByTagName('video')[0] || null;
const hook = document.querySelector('#count');

listenForFirstVideo((foundVideo) => {
  console.log('video found');
  video = foundVideo;

  // initialize notification
  globalThis.mainNotification = new notification();

  // get category from YouTube
  chrome.storage.sync.set({ currentCategory: checkCategory() });

  // interval with play / pause ability
  const timer = new intervalTimer(() => {
    console.log(timer.time++);
  }, 1000);

  // listen for play / pause
  videoListeners(video, timer);

  // listen when to save progress to database
  videoSaveProgressListener(video, timer, checkCategory());

  setTimeout(() => {
    injectCategoryString();
  }, 1000);
});
