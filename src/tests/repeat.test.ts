import { RepeatTimer, RepeatType } from '../scripts/lib/repeat'

test('repeat', async () =>
{
    const daily = new RepeatTimer({ type: RepeatType.DAILY, hour: 21 }, new Date(1999, 3, 0))
    expect(daily.get_next_date()).toStrictEqual(new Date(1999, 3, 1, 21))
    daily.trigger()
    expect(daily.get_next_date()).toStrictEqual(new Date(1999, 3, 2, 21))

    const weekly = new RepeatTimer({ type: RepeatType.WEEKLY, week_day: 3, hour: 21 }, new Date(1999, 3, 0))
    expect(weekly.get_next_date()).toStrictEqual(new Date(1999, 3, 7, 21))
    weekly.trigger()
    expect(weekly.get_next_date()).toStrictEqual(new Date(1999, 3, 14, 21))

    const monthly = new RepeatTimer({ type: RepeatType.MONTHLY, month_day: 7, hour: 21 }, new Date(1999, 3, 0))
    expect(monthly.get_next_date()).toStrictEqual(new Date(1999, 4, 7, 21))
    monthly.trigger()
    expect(monthly.get_next_date()).toStrictEqual(new Date(1999, 5, 7, 21))

    const yearly = new RepeatTimer({ type: RepeatType.YEARLY, month: 5, month_day: 7, hour: 21 }, new Date(1999, 3, 0))
    expect(yearly.get_next_date()).toStrictEqual(new Date(2000, 5, 7, 21))
    yearly.trigger()
    expect(yearly.get_next_date()).toStrictEqual(new Date(2001, 5, 7, 21))
})
