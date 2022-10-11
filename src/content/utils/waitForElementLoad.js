export default function waitForElementLoad(element, callback) {
    let pageLoadInterval = null;
    const elementName = element;
    const waitUntilPageLoaded = () => {
        console.log('waiting');
        const elementObj = document.querySelector(elementName);
        if (elementObj === null) return;
        clearInterval(pageLoadInterval);
        pageLoadInterval = null;

        callback(elementObj);
    };

    pageLoadInterval = setInterval(waitUntilPageLoaded, 100);
}
