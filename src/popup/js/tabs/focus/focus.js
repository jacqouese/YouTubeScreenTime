import youtubeCategories from '../../../data/youtubeCategories';
import { globalState, updater } from '../../state/state';
import { tableFocus } from './tableFocus';

function handleWhitelistButton() {
    const button = document.querySelector('#whitelist-btn');

    button.addEventListener('click', () => {
        document.querySelector('.popup-section-whitelist').classList.add('show');
    });
}

function handlePopupBackButton() {
    const button = document.querySelector('#whitelist-back-btn');

    button.addEventListener('click', () => {
        document.querySelector('.popup-section-whitelist').classList.remove('show');
    });
}

export function focus() {
    updater(() => {
        console.log(globalState);
        tableFocus(globalState.whitelistedItems.state, youtubeCategories);
    }, 'whitelistedItems');

    handleWhitelistButton();
    handlePopupBackButton();
}
