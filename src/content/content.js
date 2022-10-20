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
import redirectHomepageToSubscribtions from './utils/redirectHomepage';
import main from './main';

const isPageInFocus = document.hasFocus();
const elementToWaitFor = getHrefSubpage() === '/watch' ? 'video' : 'body';

// Wait for page to receive focus and load, then run main()
if (isPageInFocus) {
    waitForElementLoad(elementToWaitFor, () => {
        main();
    });
} else {
    document.addEventListener(
        'focusin',
        () => {
            waitForElementLoad(elementToWaitFor, () => {
                main();
            });
        },
        { once: true }
    );
}
