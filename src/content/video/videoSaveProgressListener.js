import { getDate } from '../helpers/getDate';
import VideoCategoryService from '../service/videoCategoryService';
import { setState } from '../state/state';

export function sendToDB(time, date, category) {
    if (category === undefined || time === 0) return;
    console.log('progress saved under', category);
    chrome.runtime.sendMessage(
        {
            for: 'background',
            type: 'watchtime/create',
            body: {
                time: time,
                date: date,
                category: category,
            },
        },
        (res) => {
            // console.log(`${res.data.timeRemaining} seconds left`);
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
        }
    );
}

export function videoSaveProgressListener(video, timer) {
    document.addEventListener('transitionend', () => {
        // pause timer if no video detected
        if (video.src === '') {
            if (timer.isResumed === true) {
                timer.pause();
                sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
                timer.time = 0;
            }
        }
    });

    // when url changes
    chrome.runtime.onMessage.addListener((req) => {
        if (req.type === 'newURL') {
            setState('hasShownNotification', false);
        }

        if (req.type === 'newURL' && timer.time != 0) {
            sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
            timer.time = 0;
            timer.pause();
        }
    });

    // when user closes tab
    window.onbeforeunload = () => {
        if (timer.time != 0) {
            sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
            timer.time = 0;
        }
    };
}
