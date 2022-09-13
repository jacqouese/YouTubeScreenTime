import youtubeCategories from '../../../data/youtubeCategories';
import { dataRequest } from '../../services/dataRequest';
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

function handleDeleteButton() {
    const buttons = document.querySelectorAll('.delete-whitelist');

    buttons.forEach((button) => {
        const restrictionCategory = button.getAttribute('att-restriction');

        button.addEventListener('click', function buttonListen() {
            dataRequest.call({ type: 'whitelist/delete', body: { category: restrictionCategory } });
            dataRequest.call({ type: 'whitelist/get' }, (res) => {
                window.ytData.whitelistedItems = res.data.whitelist;
                globalState.whitelistedItems.setState(res.data.whitelist);
            });
        });
    });
}

export function focus() {
    updater(() => {
        tableFocus(globalState.whitelistedItems.state, youtubeCategories);
        handleDeleteButton();
    }, 'whitelistedItems');

    handleWhitelistButton();
    handlePopupBackButton();
}
