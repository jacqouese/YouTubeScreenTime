// return days of the current week
export function getCurrentWeekBound() {
  var arrayOfDays = [];
  var curr = new Date(); // get current date
  const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
  const last = first + 6; // last day is the first day + 6

  for (let i = 0; i <= 6; i++) {
    var tempDay = first + i;
    var tempDate = new Date(curr.setDate(tempDay));

    var dateDateFormated =
      tempDate.getFullYear() +
      '-' +
      (tempDate.getMonth() + 1) +
      '-' +
      tempDate.getDate();

    arrayOfDays.push(dateDateFormated);
  }
  return arrayOfDays;
}
