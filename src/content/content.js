import { intervalTimer } from './helpers/intervalTimer';

import { checkCategory } from './category/extractCategory';
import { videoListeners } from './video/videoListeners';
import { sendToDB, videoSaveProgressListener } from './video/videoSaveProgressListener';
import { listenForFirstVideo } from './api/listenForFirstVideo';
import { getDate } from './helpers/getDate';
import { checkTimeRemaining } from './api/checkTimeRemaining';
import { listenForSettingChanges } from './settings/listenForSettingChanges';
import { notificationService } from './service/notificationService';
import { cLog, isVideoLoaded } from './utils/utils';
import { injectCategoryString } from './inject/injectCategoryString';
import { globalState, setState, updater } from './state/state';
import { checkIfCanWatchInFocus } from './api/checkIfCanWatchInFocus';

let video = document.getElementsByTagName('video')[-1] || null;
const hook = document.querySelector('#count');

listenForSettingChanges();

listenForFirstVideo((foundVideo) => {
    if (window.ytData.settings.isExtensionPaused == 'true') return;

    cLog('video found');
    video = foundVideo;

    // initialize notification
    globalThis.mainNotification = new notificationService();

    // get category from YouTube
    chrome.storage.sync.set({ currentCategory: checkCategory() });

    if (window.ytData.settings.displayCategory == 'true') {
        let pageLoadInterval = null;
        const waitUntilPageLoaded = () => {
            if (isVideoLoaded() === null || video.readyState < 2) return;
            clearInterval(pageLoadInterval);
            pageLoadInterval = null;
            injectCategoryString();
        };

        pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
    }
    setState('hasShownNotification', false);
    setState('hasShownWarning', false);
    // interval with play / pause ability
    const timer = new intervalTimer(() => {
        cLog(timer.time++);

        // autosave every 60 seconds
        if (timer.time === 60) {
            sendToDB(timer.time, getDate(), checkCategory());
            timer.time = 0;
        }
        if (timer.time === 2) {
            checkTimeRemaining(checkCategory());
            if (window.ytData.settings.focusMode == 'true') {
                checkIfCanWatchInFocus(checkCategory(), (res) => {
                    if (res === false) console.log('not allowed in focus, redirecting...');
                });
            }
        }
    }, 1000);
    timer.pause();

    // listen for play / pause
    videoListeners(video, timer);

    // listen when to save progress to database
    videoSaveProgressListener(video, timer, checkCategory());
});
