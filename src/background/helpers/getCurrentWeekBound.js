// return days of the current week
export function getCurrentWeekBound() {
    var arrayOfDays = [];
    var curr = new Date(); // get current date

    const tempDate = new Date();

    tempDate.setDate(
        // initially first day of the current week
        curr.getDate() - curr.getDay() + (curr.getDay() == 0 ? -6 : 1) // make Sunday the last day
    );

    for (let i = 0; i <= 6; i++) {
        var dateDateFormated = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();

        arrayOfDays.push(dateDateFormated);

        tempDate.setDate(tempDate.getDate() + 1);
    }

    return arrayOfDays;
}
