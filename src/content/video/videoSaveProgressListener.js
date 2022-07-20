import { checkTimeRemaining } from '../api/checkTimeRemaining';
import { checkCategory } from '../category/extractCategory';
import { getDate } from '../helpers/getDate';
import { injectCategoryString } from '../inject/injectCategoryString';

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

export function videoSaveProgressListener(video, timer, category) {
    document.addEventListener('transitionend', () => {
        // pause timer if no video detected
        if (video.src === '') {
            if (timer.isResumed === true) {
                timer.pause();
                sendToDB(timer.time, getDate(), checkCategory(), alreadyShownNotification);
                timer.time = 0;
            }
        }
    });

    // when url changes
    chrome.runtime.onMessage.addListener((req) => {
        if (req.type === 'newURL') {
            if (window.ytData.settings.displayCategory == 'true') {
                // setTimeout(() => {
                //     injectCategoryString();
                // }, 1000);
            }
        }

        if (req.type === 'newURL' && timer.time != 0) {
            sendToDB(timer.time, getDate(), checkCategory());
            timer.time = 0;
            timer.pause();
        }
    });

    // when user closes tab
    window.onbeforeunload = () => {
        if (timer.time != 0) {
            sendToDB(timer.time, getDate(), checkCategory());
            timer.time = 0;
        }
    };
}
