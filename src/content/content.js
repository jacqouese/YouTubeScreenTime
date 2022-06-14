import { intervalTimer } from './helpers/intervalTimer';

import { injectCategory, checkCategory } from './category/extractCategory';
import { videoListeners } from './video/videoListeners';
import {
    sendToDB,
    videoSaveProgressListener,
} from './video/videoSaveProgressListener';
import { listenForFirstVideo } from './api/listenForFirstVideo';
import { notification } from './notifications/notification';
import { injectCategoryString } from './inject/injectCategoryString';
import { getDate } from './helpers/getDate';
import { checkTimeRemaining } from './api/checkTimeRemaining';
import { listenForSettingChanges } from './settings/listenForSettingChanges';

let video = document.getElementsByTagName('video')[-1] || null;
const hook = document.querySelector('#count');

listenForFirstVideo((foundVideo) => {
    console.log('video found');
    video = foundVideo;

    // initialize notification
    globalThis.mainNotification = new notification();

    // get category from YouTube
    chrome.storage.sync.set({ currentCategory: checkCategory() });

    // get settings from popup
    listenForSettingChanges();

    // interval with play / pause ability
    const timer = new intervalTimer(() => {
        console.log(timer.time++);

        // autosave every 60 seconds
        if (timer.time === 60) {
            sendToDB(timer.time, getDate(), checkCategory());
            timer.time = 0;
        }
    }, 1000);

    // listen for play / pause
    videoListeners(video, timer);

    // listen when to save progress to database
    videoSaveProgressListener(video, timer, checkCategory());

    window.onfocus = () => {
        setTimeout(() => {
            if (window.ytData.settings.displayCategory == 'true') {
                injectCategoryString();
            }

            const videoCategory = checkCategory();

            if (window.ytData.settings.lowTimeNotifications == 'true') {
                checkTimeRemaining(videoCategory);
            }
        }, 1000);
    };
});
