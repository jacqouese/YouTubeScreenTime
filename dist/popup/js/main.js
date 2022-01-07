function formatHeights(data) {
  let formatedNumbers = [];
  // sum each day and push it into array
  for (const [key, value] of Object.entries(data)) {
    let total = 0;
    for (const [innerKey, innerhValue] of Object.entries(value)) {
      total += innerhValue;
    }
    formatedNumbers.push(total);
  }

  // normalize data to fit between 0-100
  const minValue = Math.min(...formatedNumbers);
  const maxValue = Math.max(...formatedNumbers);

  formatedNumbers.forEach((number, i) => {
    formatedNumbers[i] = ((number - minValue) / (maxValue - minValue)) * 100;
  });
  return formatedNumbers;
}

function chartLogic() {
  const chartBars = document.querySelectorAll('.chart-bar');
  const weekProgressArray = window.ytData.weekTotalCategory.dateObject;
  const formatedHeightArray = formatHeights(weekProgressArray);
  formatedHeightArray.forEach((singleHeight, i) => {
    const finalHeight = singleHeight === 0 ? 1 : singleHeight;
    chartBars[i].style.height = `${finalHeight}%`;
  });
}

// populate detailed table on stats page with data
function handleDetailedTable(period) {
  const detailedTable = document.querySelector('#detailed-table-table');
  detailedTable.innerHTML = '';
  // determine what period to load the table for
  var periodObject;
  if (period === 'day') {
    periodObject = window.ytData.dayTotalCategory.categoryObject;
  } else if (period === 'week') {
    periodObject = window.ytData.weekTotalCategory.categoryObject;
  } else if (period === 'month') {
    periodObject = window.ytData.monthTotalCategory.categoryObject;
  } else {
    console.warn('invalid period given');
  }

  const formatedProgressValues = [];
  const formatedProgressValuesTemp = [];
  for (const [key, value] of Object.entries(periodObject)) {
    formatedProgressValues.push([key, value]);
    formatedProgressValuesTemp.push(value);
  }

  var minValue = Math.min(...formatedProgressValuesTemp);
  var maxValue = Math.max(...formatedProgressValuesTemp);

  if ((minValue = maxValue)) minValue = 0; // prevent division by 0

  formatedProgressValuesTemp.forEach((number, i) => {
    const formatedValue = ((number - minValue) / (maxValue - minValue)) * 100;
    var userFriendlyTime = secondsToHms(formatedProgressValues[i][1]);

    const HTMLinsert = `
    <tr>
    <td>
    <div class="detailed-elem">
      <div class="detailed-color-box"></div>
      <div class="detailed-category">
        ${formatedProgressValues[i][0]}
        <div class="progress-container">
          <div class="progress" att-progress="${formatedValue}"></div>
          ${userFriendlyTime}
        </div>
      </div>
    </div>
  </td>
  </tr>`;

    detailedTable.innerHTML += HTMLinsert;
  });

  const progressBars = document.querySelectorAll('.progress');

  progressBars.forEach((bar) => {
    const value = bar.getAttribute('att-progress');

    bar.style.width = `${value}%`;
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
  window.ytData.dayTotalCategory = res.data;
  handleDetailedTable('day');
  document.querySelector('#top-stats-day').innerHTML = secondsToHms(
    res.data.time
  );
});

requestTotal('week', (res) => {
  window.ytData.weekTotalCategory = res.data;
  chartLogic();
  document.querySelector('#top-stats-week').innerHTML = secondsToHms(
    res.data.time
  );
});

requestTotal('month', (res) => {
  window.ytData.monthTotalCategory = res.data;
  document.querySelector('#top-stats-month').innerHTML = secondsToHms(
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
    return `${h}<span class="smaller">h</span> ${m}<span class="smaller">m</span>`;
  } else if (m > 0) {
    return `${m}<span class="smaller">min</span>`;
  } else {
    return `0<span class="smaller">min</span>`;
  }
}

function switchLogic() {
  const switches = document.querySelectorAll('.switch');

  switches.forEach((switchElem) => {
    switchElem.addEventListener('click', () => {
      const isActive = switchElem.classList.contains('switch-active');

      if (isActive === true) {
        switchElem.classList.remove('switch-active');
      } else {
        switchElem.classList.add('switch-active');
      }
    });
  });
}

switchLogic();

function handleMainTabs() {
  const tabsElement = document.querySelector('#main-tabs');

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
}

// handle detailed category content
function handleDetailedCategoryTabs() {
  const tabs = Array.from(
    document.querySelector('#chart-tabs').children[0].children
  );
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const period = tab.innerHTML.toLowerCase();
      handleDetailedTable(period);
      chartLogic();

      tabs.forEach((tabInner) => {
        tabInner.classList.remove('active');
      });

      // append active class to active element
      tab.classList.add('active');
    });
  });
}

handleMainTabs();
handleDetailedCategoryTabs();
