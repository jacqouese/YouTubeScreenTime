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
    formatedProgressValues.push([key, value]);
    formatedProgressValuesTemp.push(value);
  }

  formatedProgressValues = formatedProgressValues.sort().reverse();
  formatedProgressValuesTemp = formatedProgressValuesTemp.sort().reverse();

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
