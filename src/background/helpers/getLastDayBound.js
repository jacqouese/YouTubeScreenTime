export function getLastDayBound() {
    var today = new Date();

    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate() - 1);

    return [date];
}
