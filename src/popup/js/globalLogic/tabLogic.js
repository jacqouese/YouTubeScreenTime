import { chartLogic } from '../tabs/stats/chartLogic';
import { detailedTableLogic } from '../tabs/stats/detailedTableLogic';

function handleMainTabs() {
    const tabsElement = document.querySelector('#main-tabs');

    const tabs = Array.from(tabsElement.children[0].children);

    tabs.forEach((tab) => {
        const tabContents = document.querySelectorAll(`.${tabsElement.id}-tab-content`);

        let tabContent = tab.innerHTML;
        tabContent = tabContent.toLowerCase();
        const tabId = `tab-content-${tabContent}`;
        const tabContentCurrent = document.querySelector(`#${tabId}`);
        console.log(tabContentCurrent);

        tab.addEventListener('click', () => {
            // remove active class from all elements
            tabContents.forEach((tabContent) => {
                tabContent.classList.remove('active');
            });
            tabs.forEach((tabInner) => {
                tabInner.classList.remove('active');
            });

            // append active class to active elements
            tabContentCurrent.classList.add('active');
            tab.classList.add('active');
        });
    });
}

function handleDetailedCategoryTabs() {
    const tabs = Array.from(document.querySelector('#chart-tabs').children[0].children);
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const period = tab.innerHTML.toLowerCase();
            detailedTableLogic(period);

            tabs.forEach((tabInner) => {
                tabInner.classList.remove('active');
            });

            // append active class to active element
            tab.classList.add('active');
        });
    });
}

export function tabLogic() {
    handleMainTabs();
    handleDetailedCategoryTabs();
}
