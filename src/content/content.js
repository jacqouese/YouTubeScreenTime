import { intervalTimer } from './helpers/intervalTimer';
import { videoListeners } from './video/videoListeners';
import { sendToDB, videoSaveProgressListener } from './video/videoSaveProgressListener';
import { listenForFirstVideo } from './api/listenForFirstVideo';
import { getDate } from './helpers/getDate';
import { checkTimeRemaining } from './api/checkTimeRemaining';
import { listenForSettingChanges } from './settings/listenForSettingChanges';
import { notificationService } from './service/notificationService';
import { cLog, isVideoLoaded } from './utils/utils';
import { setState } from './state/state';
import { checkIfCanWatchInFocus } from './api/checkIfCanWatchInFocus';
import redirectService from './service/redirectService';
import VideoCategoryService from './service/videoCategoryService';
import FocusModeService from './service/focusModeService';
import waitForElementLoad from './utils/waitForElementLoad';
import runOnPageChange from './helpers/runOnPageChange';
import getHrefSubpage from './helpers/getHrefSubpage';

waitForElementLoad('body', () => {
    let video = document.getElementsByTagName('video')[-1] || null;
    const focusObject = new FocusModeService();

    listenForSettingChanges(() => {
        if (window.ytData.settings.focusMode == 'true') focusObject.hideDistractions();
    });

    runOnPageChange(() => {
        if (getHrefSubpage() === '/watch' || getHrefSubpage() === '/') {
            focusObject.hideDistractions();
        }
    });

    listenForFirstVideo((foundVideo) => {
        if (window.ytData.settings.isExtensionPaused == 'true') return;

        video = foundVideo;

        // initialize notification
        globalThis.mainNotification = new notificationService();

        // get category from YouTube
        chrome.storage.sync.set({ currentCategory: VideoCategoryService.checkCurrentlyWatchedVideoCategory() });

        if (window.ytData.settings.displayCategory == 'true') {
            let pageLoadInterval = null;
            const waitUntilPageLoaded = () => {
                if (isVideoLoaded() === null || video.readyState < 2) return;

                clearInterval(pageLoadInterval);
                pageLoadInterval = null;
                VideoCategoryService.injectCategoryStringIntoYouTubePage();
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
                sendToDB(timer.time, getDate(), VideoCategoryService.checkCurrentlyWatchedVideoCategory());
                timer.time = 0;
            }
            if (timer.time === 1) {
                if (window.ytData.settings.focusMode == 'true') {
                    checkIfCanWatchInFocus(VideoCategoryService.checkCurrentlyWatchedVideoCategory(), (res) => {
                        if (res === false) {
                            redirectService.redirectToFocusPage();
                            video.pause();
                        }
                    });
                }
            }
            if (timer.time === 2) {
                checkTimeRemaining(VideoCategoryService.checkCurrentlyWatchedVideoCategory());
            }
        }, 1000);
        timer.pause();

        // listen for play / pause
        videoListeners(video, timer);

        // listen when to save progress to database
        videoSaveProgressListener(video, timer);
    });
});
