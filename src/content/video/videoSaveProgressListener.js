import { showNoTimeLeftPage } from '../api/restrictions/showNoTimeLeftPage';
import { checkCategory } from '../category/extractCategory';
import { getDate } from '../helpers/getDate';

function sendToDB(time, date, category) {
  if (category === undefined || time === 0) return;
  console.log('progress saved under', category);
  chrome.runtime.sendMessage(
    {
      for: 'background',
      type: 'saveRequest',
      body: {
        time: time,
        date: date,
        category: category,
      },
    },
    (res) => {
      if (res.data.isTimeLeft === false) {
        console.log('%cRestriction trigger!!!', 'color: red');
        mainNotification.createSimpleNotification(category);
      }
    }
  );
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

  // when url changes
  chrome.runtime.onMessage.addListener((req) => {
    if (req.type === 'newURL' && timer.time != 0) {
      sendToDB(timer.time, getDate(), checkCategory());
      timer.time = 0;
    }
  });

  // when user closes tab
  window.onbeforeunload = () => {
    if (timer.time != 0 && video.src === '') {
      sendToDB(timer.time, getDate(), checkCategory());
      timer.time = 0;

      return 'you sure?';
    }
  };
}
