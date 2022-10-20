import waitForElementLoad from './utils/waitForElementLoad';
import getHrefSubpage from './helpers/getHrefSubpage';
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
