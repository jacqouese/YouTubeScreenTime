export function getLastMonthBound() {
    var arrayOfDays = [];
    var curr = new Date(); // get current date

    const daysInMonth = new Date(curr.getFullYear(), curr.getMonth(), 0).getDate(); // returns how many days the current month has

    for (let i = 1; i <= daysInMonth; i++) {
        var tempDate = new Date(curr.setDate(i));

        var dateDateFormated = tempDate.getFullYear() + '-' + tempDate.getMonth() + '-' + tempDate.getDate();

        arrayOfDays.push(dateDateFormated);
    }
    return arrayOfDays;
}
