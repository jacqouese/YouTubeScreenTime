import { cLog } from './utils';

export default function waitForElementLoad(element, callback) {
    let iterator = 0;
    let pageLoadInterval = null;
    const elementName = element;
    const waitUntilPageLoaded = () => {
        cLog('waiting for element load', element);
        iterator += 1;
        if (iterator > 20) {
            console.error('[yt-d]', `Waiting for element ${element} exceeded max time`);
            return clearInterval(pageLoadInterval);
        }
        const elementObj = document.querySelector(elementName);
        if (elementObj === null) return;
        clearInterval(pageLoadInterval);
        pageLoadInterval = null;

        callback(elementObj);
    };

    pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
}
