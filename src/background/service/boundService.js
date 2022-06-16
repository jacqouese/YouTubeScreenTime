import { getCurrentDayBound } from '../helpers/getCurrentDayBound';
import { getCurrentMonthBound } from '../helpers/getCurrentMonthBound';
import { getCurrentWeekBound } from '../helpers/getCurrentWeekBound';

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

    return console.error(
        'invalid period given, valid period values include: day, week, month'
    );
}
