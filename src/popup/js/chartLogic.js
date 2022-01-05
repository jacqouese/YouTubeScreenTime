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
