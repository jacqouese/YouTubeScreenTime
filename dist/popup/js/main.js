const chartBars = document.querySelectorAll('.chart-bar');

chartBars.forEach((bar) => {
    const att = bar.getAttribute('att-height');

    bar.style.height = `${att}%`;
});

// populate detailed table on stats page with data
function handleDetailedTable(period) {
  const detailedTable = document.querySelector('#detailed-table-table');
  detailedTable.innerHTML = '';
  // determine what period to load the table for
  var periodObject;
  if (period === 'day') {
    periodObject = window.ytData.dayTotalCategory;
  } else if (period === 'week') {
    periodObject = window.ytData.weekTotalCategory;
  } else if (period === 'month') {
    periodObject = window.ytData.monthTotalCategory;
  } else {
    console.warn('invalid period given');
  }

  for (const [key, value] of Object.entries(periodObject)) {
    var userFriendlyTime = secondsToHms(value);
    const HTMLinsert = `
    <tr>
    <td>
    <div class="detailed-elem">
      <div class="detailed-color-box"></div>
      <div class="detailed-category">
        ${key}
        <div class="progress-container">
          <div class="progress" att-progress="${value}"></div>
          ${userFriendlyTime}
        </div>
      </div>
    </div>
  </td>
  </tr>`;

    detailedTable.innerHTML += HTMLinsert;
  }

  const progressBars = document.querySelectorAll('.progress');

  progressBars.forEach((bar) => {
    const value = bar.getAttribute('att-progress');

    bar.style.width = `${value % 100}%`;
  });
}

// initialize global object
window.ytData = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
});

function requestTotal(period, callback) {
  chrome.extension.sendMessage(
    { type: 'dataRequest', body: { period: period, category: 'all' } },
    function (res) {
      if (res.status !== 200)
        return console.warn('Failed to get data from background');

      callback(res);
    }
  );
}

requestTotal('day', (res) => {
  window.ytData.dayTotalCategory = res.data.categoryObject;
  handleDetailedTable('day');
  document.querySelector('#top-stats-day').innerHTML = secondsToHms(
    res.data.time
  );
});

requestTotal('week', (res) => {
  window.ytData.weekTotalCategory = res.data.categoryObject;
  console.log(res.data.categoryObject);
  document.querySelector('#top-stats-week').innerHTML = secondsToHms(
    res.data.time
  );
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

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  if (h > 0) {
    return `${h}<span class="smaller">h<span>`;
  } else if (m > 0) {
    return `${m}<span class="smaller">min<span>`;
  } else {
    return `0<span class="smaller">min<span>`;
  }
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

// handle detailed category content
const tabs = Array.from(
  document.querySelector('#chart-tabs').children[0].children
);
console.log(tabs);
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const period = tab.innerHTML.toLowerCase();
    handleDetailedTable(period);
  });
});
