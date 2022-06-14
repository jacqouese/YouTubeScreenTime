import { secondsToHms } from '../../helpers/secondsToHms';

// populate detailed table on stats page with data
export function detailedTableLogic(period) {
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

    let formatedProgressValues = [];
    let formatedProgressValuesTemp = [];
    for (const [key, value] of Object.entries(periodObject)) {
        // convert obj to array
        formatedProgressValues.push([key, value]); // 2d array
        formatedProgressValuesTemp.push(value); // 1d array
    }

    formatedProgressValues = formatedProgressValues.sort(sortRules).reverse();
    formatedProgressValuesTemp = formatedProgressValuesTemp.sort();

    function sortRules(a, b) {
        if (a[1] === b[1]) {
            return 0;
        } else {
            return a[1] < b[1] ? -1 : 1;
        }
    }

    var minValue = Math.min(...formatedProgressValuesTemp);
    var maxValue = Math.max(...formatedProgressValuesTemp);

    if ((minValue = maxValue)) minValue = 0; // prevent division by 0

    formatedProgressValues.forEach((innerArray, i) => {
        if (innerArray[1] < 60) return; // if shorter than 1 min

        const formatedValue =
            ((innerArray[1] - minValue) / (maxValue - minValue)) * 100;
        var userFriendlyTime = secondsToHms(formatedProgressValues[i][1]);

        const HTMLinsert = `
    <tr>
    <td>
    <div class="detailed-elem">
      <div class="detailed-color-box"></div>
      <div class="detailed-category">
        ${innerArray[0]}
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

    progressBars.forEach((bar, i) => {
        const value = bar.getAttribute('att-progress');

        setTimeout(() => {
            bar.style.width = `${value}%`;
            bar.style.transition = `all ${
                ((i + 1) / (i + 2)) * 3
            }s cubic-bezier(0.23, 0.76, 0.735, 0.955)`;
        }, 50);
    });
}
