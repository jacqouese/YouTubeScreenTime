import { intervalTimer } from './helpers/intervalTimer';

import { injectCategory, checkCategory } from './category/extractCategory';
import { videoListeners } from './video/videoListeners';
import { videoSaveProgress } from './video/videoSaveProgress';

const video = document.getElementsByTagName('video')[0] || null;
const hook = document.querySelector('#count');

if (video !== null) {
  // get category from YouTube
  injectCategory();

  console.log(checkCategory());

  chrome.storage.local.set({ currentCategory: checkCategory() });

  var time = 0;

  // interval with play/pause ability
  const timer = new intervalTimer(() => {
    console.log(timer.time++);
  }, 1000);

  // listen for play / pause
  videoListeners(video, timer);

  // save time when user exits
  videoSaveProgress(video, timer);
} else {
  console.log('no video');
}
