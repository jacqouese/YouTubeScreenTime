import { setUserSettings } from '../api/setUserSettings';

export function switchLogic() {
    const switches = document.querySelectorAll('.switch');

    switches.forEach((switchElem) => {
        const switchName = switchElem.getAttribute('att-switch-name');
        // set initial switch state
        if (window.ytData.settings[switchName]) {
            console.log(window.ytData.settings);
            if (window.ytData.settings[switchName] == 'true') {
                switchElem.classList.add('switch-active');
            }
        }

        switchElem.addEventListener('click', () => {
            const isActive = switchElem.classList.contains('switch-active');

            if (isActive === true) {
                switchElem.classList.remove('switch-active');
                setUserSettings(switchName, false);
            } else {
                switchElem.classList.add('switch-active');
                setUserSettings(switchName, true);
            }
        });
    });
}
