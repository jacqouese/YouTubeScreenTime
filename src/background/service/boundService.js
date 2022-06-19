import { getCurrentDayBound } from '../helpers/getCurrentDayBound';
import { getCurrentMonthBound } from '../helpers/getCurrentMonthBound';
import { getCurrentWeekBound } from '../helpers/getCurrentWeekBound';
import { getLastDayBound } from '../helpers/getLastDayBound';
import { getLastMonthBound } from '../helpers/getLastMonthBound';
import { getLastWeekBound } from '../helpers/getLastWeekBound';

export function determineBound(period) {
    if (period === 'day') {
        return getCurrentDayBound();
    }

    if (period === 'week') {
        return getCurrentWeekBound();
    }

    if (period === 'month') {
        return getCurrentMonthBound();
    }

    if (period === 'lastday') {
        return getLastDayBound();
    }

    if (period === 'lastweek') {
        return getLastWeekBound();
    }

    if (period === 'lastmonth') {
        return getLastMonthBound();
    }

    return console.error('invalid period given, valid period values include: day, week, month');
}
