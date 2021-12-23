const chartBars = document.querySelectorAll('.chart-bar');

chartBars.forEach((bar) => {
    const att = bar.getAttribute('att-height');

    bar.style.height = `${att}%`;
});

const categories = {
    Music: 70,
    Entertainment: 50,
    Autos: 20,
    Others: 10,
};

const detailedTable = document.querySelector('#detailed-table-table');

for (const [key, value] of Object.entries(categories)) {
    const HTMLinsert = `
    <tr>
    <td>
    <div class="detailed-elem">
      <div class="detailed-color-box"></div>
      <div class="detailed-category">
        ${key}
        <div class="progress" att-progress="${value}"></div>
      </div>
    </div>
  </td>
  </tr>`;

    detailedTable.innerHTML += HTMLinsert;
}

const progressBars = document.querySelectorAll('.progress');

progressBars.forEach((bar) => {
    const value = bar.getAttribute('att-progress');

    bar.style.width = `${value}%`;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  document.querySelector('#cat').innerHTML = `${(request.subject / 60).toFixed(
    1
  )}h`;
});

let watchedCategory = null;

chrome.storage.sync.get(['currentCategory'], (result) => {
  watchedCategory = result.currentCategory;

  console.log(watchedCategory);
});

chrome.storage.sync.get(['category'], (result) => {
  category = result.category;

  console.log(result);

  document.querySelector('#cat').innerHTML = `${(category / 60).toFixed(2)}h`;
});

const myRestrictions = {
    '🎧 Music': '10.0d',
    '🖥️ Entertainment': '6.0d',
    '📱 Autos': '16.0w',
    '📚 Others': '2.0d',
};

const restrictedTable = document.querySelector('#table-restricted');

for (const [key, value] of Object.entries(myRestrictions)) {
    const HTMLinsert = `
    <tr>
        <td>
            <div class="table-inner-wrapper">
                <span class="longer">${key}</span>
                <span>${value}</span>
                <span><img src="./assets/remove.png" alt="x"></span>
            </div>
        </td>
    </tr>`;

    restrictedTable.innerHTML += HTMLinsert;
}
const restrictionList = {
    '🎧 Music': false,
    '🖥️ Entertainment': false,
    '📱 Autos': false,
    '📚 Others': false,
};

const listTable = document.querySelector('#table-restrict-list');

for (const [key, value] of Object.entries(restrictionList)) {
    const HTMLinsert = `
    <tr>
        <td>
            <div class="table-inner-wrapper">
                <span>${key}</span>
                <span>></span>
            </div>
        </td>
    </tr>`;

    listTable.innerHTML += HTMLinsert;
}

const switches = document.querySelectorAll('.switch');

switches.forEach((switchElem) => {
  switchElem.addEventListener('click', () => {
    console.log('click');
    const isActive = switchElem.classList.contains('switch-active');

    if (isActive === true) {
      switchElem.classList.remove('switch-active');
    } else {
      switchElem.classList.add('switch-active');
    }
  });
});

const tabsElements = document.querySelectorAll('.tabs');

tabsElements.forEach((tabsElement) => {
    const tabs = Array.from(tabsElement.children[0].children);

    tabs.forEach((tab) => {
        const tabContents = document.querySelectorAll(
            `.${tabsElement.id}-tab-content`
        );
        // determine tab id
        let tabContent = tab.innerHTML;
        tabContent = tabContent.toLowerCase();
        const tabId = `tab-content-${tabContent}`;
        const tabContentCurrent = document.querySelector(`#${tabId}`);

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
});
