import { intervalTimer } from './helpers/intervalTimer';

import { injectCategory, checkCategory } from './category/extractCategory';
import { videoListeners } from './video/videoListeners';
import { videoSaveProgress } from './video/videoSaveProgress';

const video = document.getElementsByTagName('video')[0] || null;
const hook = document.querySelector('#count');

if (video !== null) {
  // get category from YouTube

  chrome.storage.sync.set({ currentCategory: checkCategory() });

  // interval with play/pause ability
  const timer = new intervalTimer(() => {
    console.log(timer.time++);
  }, 1000);

  // listen for URL change to update category
  chrome.runtime.onMessage.addListener(() => {
    console.log('url change');
  });

  // listen for play / pause
  videoListeners(video, timer);

  // save time when user exits
  videoSaveProgress(video, timer, checkCategory());
} else {
  console.log('no video');
}
