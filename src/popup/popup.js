import { loadData } from './js/api/loadData';

import { switchLogic } from './js/globalLogic/switchLogic';
import { tabLogic } from './js/globalLogic/tabLogic';

import { restrict } from './js/tabs/restrict/restrict';
import { stats } from './js/tabs/stats/stats';
import { focus } from './js/tabs/focus/focus';

export function main() {
    loadData(() => {
        // global elements logic
        tabLogic();
        switchLogic();

        // logic for each tab
        stats();
        restrict();
        focus();
    });
}

main();
