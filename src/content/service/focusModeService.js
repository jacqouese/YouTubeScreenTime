import getHrefSubpage from '../helpers/getHrefSubpage';
import waitForElementLoad from '../utils/waitForElementLoad';

class FocusModeService {
    hideDistractions() {
        console.log('Hide distrations - current page:', getHrefSubpage());
        if (getHrefSubpage() === '/') {
            waitForElementLoad('ytd-two-column-browse-results-renderer', (element) => {
                element.innerHTML = '';
            });
        }

        if (getHrefSubpage() === '/watch') {
            waitForElementLoad('#secondary', (element) => {
                element.innerHTML = '';
            });
        }
    }
}

export default FocusModeService;
