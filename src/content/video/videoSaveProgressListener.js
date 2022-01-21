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
      console.log(`${res.data.timeRemaining} seconds left`);
      if (res.data.isTimeLeft === false) {
        console.log('%cRestriction trigger!!!', 'color: red');
        mainNotification.createSimpleNotification(
          `Time for ${category} has run out`,
          `The time limit you set for ${category} has run out. Check YouTube ScreenTime extension for more details.`
        );
      } else if (
        res.data.timeRemaining !== null &&
        res.data.timeRemaining < 300
      ) {
        mainNotification.createSimpleNotification(
          `Less than 5 min for ${category}`,
          `The time limit you set for ${category} has almost run out.`
        );
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
    if (timer.time != 0) {
      sendToDB(timer.time, getDate(), checkCategory());
      timer.time = 0;

      return 'you sure?';
    }
  };
}
