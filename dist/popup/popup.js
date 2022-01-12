(function (factory) {
  typeof define === 'function' && define.amd ? define('popup', factory) :
  factory();
}((function () { 'use strict';

  function requestTotal(period, callback) {
    chrome.extension.sendMessage({
      type: 'dataRequest',
      body: {
        period: period,
        category: 'all'
      }
    }, function (res) {
      if (res.status !== 200) return console.warn('Failed to get data from background');
      callback(res);
    });
  }

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);

    if (h > 0) {
      return `${h}<span class="smaller">h</span> ${m}<span class="smaller">m</span>`;
    } else if (m > 0) {
      return `${m}<span class="smaller">min</span>`;
    } else {
      return `0<span class="smaller">min</span>`;
    }
  }

  function loadData(callback) {
    // initialize global object
    window.ytData = {};
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request);
    }); // request total for each period

    requestTotal('day', res => {
      window.ytData.dayTotalCategory = res.data;
      document.querySelector('#top-stats-day').innerHTML = secondsToHms(res.data.time);
    });
    requestTotal('week', res => {
      window.ytData.weekTotalCategory = res.data;
      document.querySelector('#top-stats-week').innerHTML = secondsToHms(res.data.time);
    });
    requestTotal('month', res => {
      window.ytData.monthTotalCategory = res.data;
      document.querySelector('#top-stats-month').innerHTML = secondsToHms(res.data.time);
      callback();
    });
  }

  function switchLogic() {
    const switches = document.querySelectorAll('.switch');
    switches.forEach(switchElem => {
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

  function formatHeights(data) {
    let formatedNumbers = []; // sum each day and push it into array

    for (const [key, value] of Object.entries(data)) {
      let total = 0;

      for (const [innerKey, innerhValue] of Object.entries(value)) {
        total += innerhValue;
      }

      formatedNumbers.push(total);
    } // normalize data to fit between 0-100


    const minValue = Math.min(...formatedNumbers);
    const maxValue = Math.max(...formatedNumbers);
    formatedNumbers.forEach((number, i) => {
      formatedNumbers[i] = (number - minValue) / (maxValue - minValue) * 100;
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

  function detailedTableLogic(period) {
    const detailedTable = document.querySelector('#detailed-table-table');
    detailedTable.innerHTML = ''; // determine what period to load the table for

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
    if (minValue = maxValue) minValue = 0; // prevent division by 0

    formatedProgressValuesTemp.forEach((number, i) => {
      const formatedValue = (number - minValue) / (maxValue - minValue) * 100;
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
    progressBars.forEach(bar => {
      const value = bar.getAttribute('att-progress');
      bar.style.width = `${value}%`;
    });
  }

  function handleMainTabs() {
    const tabsElement = document.querySelector('#main-tabs');
    const tabs = Array.from(tabsElement.children[0].children);
    tabs.forEach(tab => {
      const tabContents = document.querySelectorAll(`.${tabsElement.id}-tab-content`); // determine tab id

      let tabContent = tab.innerHTML;
      tabContent = tabContent.toLowerCase();
      const tabId = `tab-content-${tabContent}`;
      const tabContentCurrent = document.querySelector(`#${tabId}`);
      tab.addEventListener('click', () => {
        // remove active class from all elements
        tabContents.forEach(tabContent => {
          tabContent.classList.remove('active');
        });
        tabs.forEach(tabInner => {
          tabInner.classList.remove('active');
        }); // append active class to active elements

        tabContentCurrent.classList.add('active');
        tab.classList.add('active');
      });
    });
  } // handle detailed category content


  function handleDetailedCategoryTabs() {
    const tabs = Array.from(document.querySelector('#chart-tabs').children[0].children);
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const period = tab.innerHTML.toLowerCase();
        detailedTableLogic(period);
        chartLogic();
        tabs.forEach(tabInner => {
          tabInner.classList.remove('active');
        }); // append active class to active element

        tab.classList.add('active');
      });
    });
  }

  function tabLogic() {
    handleMainTabs();
    handleDetailedCategoryTabs();
  }

  function restrictPupup(restriction) {
    const createPopup = () => {
      document.querySelector('.popup-section').classList.add('show');
    };


    document.querySelector('.popup-section').querySelector('#restriction-name').textContent = restriction;
    createPopup();
  }

  function restrictTable() {
    const myRestrictions = {
      '🎧 Music': '10.0d',
      '🖥️ Entertainment': '6.0d',
      '📱 Autos': '16.0w',
      '📚 Others': '2.0d'
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
      Music: '🎧',
      Entertainment: '🖥️',
      Autos: '📱',
      Others: '📚'
    };
    const listTable = document.querySelector('#table-restrict-list');

    for (const [key, value] of Object.entries(restrictionList)) {
      const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span class="restriction-name" att-name=${key}>${value} ${key}</span>
                    <span>></span>
                </div>
            </td>
        </tr>`;
      listTable.innerHTML += HTMLinsert;
    }

    console.log(listTable.querySelectorAll('td'));
    listTable.querySelectorAll('td').forEach(elem => {
      elem.addEventListener('click', () => {
        const restrictionName = elem.querySelector('.restriction-name').getAttribute('att-name');
        console.log(restrictionName);
        restrictPupup(restrictionName);
      });
    });
  }

  function timeInputs() {
    // limit max hours to 999
    document.querySelector('.time-input-hours').addEventListener('keyup', e => {
      if (e.target.value > 999) {
        e.target.value = Math.floor(e.target.value / 10); // trim last digit
      }
    }); // limit max minutes to 59

    document.querySelector('.time-input-minutes').addEventListener('keyup', e => {
      if (e.target.value > 59) {
        e.target.value = 59;
      }
    });
  }

  function handleButtons() {
    document.querySelector('#restrict-btn').addEventListener('click', () => {
      const hours = document.querySelector('.time-input-hours').value;
      const minutes = document.querySelector('.time-input-minutes').value;
      if (hours <= 0 && minutes <= 0) return;
      console.log(hours);
      document.querySelector('.popup-section').classList.remove('show'); // reset inputs

      document.querySelector('.time-input-hours').value = '';
      document.querySelector('.time-input-minutes').value = '';
    });
  }

  function handleBackButton() {
    document.querySelector('.back-btn').addEventListener('click', () => {
      document.querySelector('.popup-section').classList.remove('show'); // reset inputs

      document.querySelector('.time-input-hours').value = '';
      document.querySelector('.time-input-minutes').value = '';
    });
  }

  function restrict() {
    restrictTable();
    timeInputs();
    handleButtons();
    handleBackButton();
  }

  function stats() {
    detailedTableLogic('day');
    chartLogic();
  }

  loadData(() => {
    // global elements logic
    tabLogic();
    switchLogic(); // logic for each tab

    stats();
    restrict();
  });

})));
