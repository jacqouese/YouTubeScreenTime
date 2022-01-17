import { checkCategory } from '../category/extractCategory';
import { getDate } from '../helpers/getDate';

function sendToDB(time, date, category) {
  if (category === undefined || time === 0) return;

  console.log('progress saved under', category);
  chrome.runtime.sendMessage({
    for: 'background',
    type: 'saveRequest',
    body: {
      time: time,
      date: date,
      category: category,
    },
  });
}

export function videoSaveProgressListener(video, timer, category) {
  document.addEventListener('transitionend', () => {
    // pause timer if no video detected
    if (video.src === '') {
      if (timer.isResumed === true) {
        timer.pause();
        sendToDB(timer.time, getDate(), checkCategory());
        timer.time = 0;
      }
    }
  });
  chrome.runtime.onMessage.addListener(() => {
    if (timer.time != 0) {
      sendToDB(timer.time, getDate(), checkCategory());
      timer.time = 0;
    }
  });

  window.onbeforeunload = () => {
    if (timer.time != 0 && video.src === '') {
      sendToDB(timer.time, getDate(), checkCategory());
      timer.time = 0;

      return 'you sure?';
    }
  };
}
