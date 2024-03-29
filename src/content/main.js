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

export default function main() {
    let video = document.getElementsByTagName('video')[-1] || null;

    const focusObject = new FocusModeService();

    listenForSettingChanges(() => {
        if (getHrefSubpage() === '/') {
            if (window.ytData.settings.redirectHomepage == 'true') {
                location.replace('https://www.youtube.com/feed/subscriptions');
            }
        }

        if (getHrefSubpage() === '/' || getHrefSubpage() === '/watch') {
            if (window.ytData.settings.hideSuggestions == 'true') focusObject.hideDistractions();
        }
    });

    runOnPageChange(() => {
        setState('hasShownNotification', false);
        setState('hasShownWarning', false);
        if (getHrefSubpage() === '/') {
            if (window.ytData.settings.redirectHomepage == 'true') {
                location.replace('https://www.youtube.com/feed/subscriptions');
            }
        }
        if (getHrefSubpage() === '/' || getHrefSubpage() === '/watch') {
            if (window.ytData.settings.hideSuggestions == 'true') focusObject.hideDistractions();
        }
    });

    waitForElementLoad('video', (foundVideo) => {
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
                            video.pause();
                            function autoPauseVideo() {
                                video.pause();
                            }

                            video.addEventListener('playing', autoPauseVideo);
                            runOnPageChange(() => {
                                video.removeEventListener('playing', autoPauseVideo);
                            });
                            mainNotification.createFocusModeNotification(
                                VideoCategoryService.checkCurrentlyWatchedVideoCategory(),
                                {
                                    name: 'Watch anyway',
                                    onClick: () => {
                                        console.log('action');
                                        video.removeEventListener('playing', autoPauseVideo);
                                        video.play();
                                    },
                                }
                            );
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
}
