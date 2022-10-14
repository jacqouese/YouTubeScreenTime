import { cLog } from './utils';

export default function waitForElementLoad(element, callback) {
    let pageLoadInterval = null;
    const elementName = element;
    const waitUntilPageLoaded = () => {
        cLog('waiting for element load', element);
        const elementObj = document.querySelector(elementName);
        if (elementObj === null) return;
        clearInterval(pageLoadInterval);
        pageLoadInterval = null;

        callback(elementObj);
    };

    pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
}
