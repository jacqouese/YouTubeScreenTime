import { checkCategory } from '../category/extractCategory';
import { getDate } from '../helpers/getDate';

function sendToDB(time, date, category) {
  chrome.runtime.sendMessage({
    for: 'background',
    type: 'saveRequest',
    videoSave: {
      time: time,
      date: date,
      category: category,
    },
  });
}

export function videoSaveProgress(video, timer, category) {
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
