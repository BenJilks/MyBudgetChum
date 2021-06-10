import { MONTHS } from './lib/config'
import { PiChart } from './lib/pi_chart'
import { BarChart } from './lib/bar_chart'
import { Group, Transaction } from './lib/transaction'
import { ReportType, create_report } from './lib/report'
import { $ } from './lib/util'

const LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

let category_spending: PiChart
let place_spending: PiChart
let bar_chart: BarChart
let current_week: Date

function get_week_start_and_end(date: Date): [Date, Date]
{
    const start = new Date(date.valueOf())
    start.setDate(date.getDate() - date.getDay())

    const end = new Date(date.valueOf())
    end.setDate(start.getDate() + 7)

    return [start, end]
}

async function report_for_week(type: ReportType, start: Date, end: Date): Promise<Map<Group, number>>
{
    const report = await create_report(start, end, type)
    if (report.size == 0)
        report.set({ name: 'Nothing', color: 0xFFFFFF }, 0)

    return report
}

async function load_week(date: Date)
{
    const month = MONTHS[date.getMonth()]
    const week_num = Math.floor(date.getDate() / 7)
    const [start, end] = get_week_start_and_end(date)
    $('#week-display').innerHTML = `${ month } Week ${ week_num + 1 }`

    const category_data = await report_for_week(ReportType.CATEGORY, start, end)
    category_spending.set_data(category_data)

    const place_data = await report_for_week(ReportType.PLACE, start, end)
    console.log(place_data)
    place_spending.set_data(place_data)

    const transactions = await Transaction.get_in_range(start, end)
    let day = new Date(start.valueOf())
    let data = []
    for (let i = 0; i < 7; i++)
    {
        data.push(
        {
            label: LABELS[i], 
            value: transactions
                .filter(x => x.timestamp.getDate() == day.getDate())
                .reduce((acc, x) => acc -= x.amount, 0)
        })

        day.setDate(day.getDate() + 1)
    }
    bar_chart.set_data(data)
}

window.onload = async () =>
{
    category_spending = new PiChart($('#category-spending') as HTMLDivElement)
    place_spending = new PiChart($('#place-spending') as HTMLDivElement)
    bar_chart = new BarChart($('#bar-chart') as HTMLDivElement)
    $('#back-a-week').onclick = back_a_week
    $('#forward-a-week').onclick = forward_a_week

    current_week = new Date(Date.now())
    current_week.setDate(current_week.getDate() - current_week.getDay())
    await load_week(current_week)
}

async function back_a_week()
{
    current_week.setDate(current_week.getDate() - 7)
    await load_week(current_week)
}

async function forward_a_week()
{
    current_week.setDate(current_week.getDate() + 7)
    await load_week(current_week)
}
