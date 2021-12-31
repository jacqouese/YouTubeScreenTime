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
