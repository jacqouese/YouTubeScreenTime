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
    console.log(minValue);
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
