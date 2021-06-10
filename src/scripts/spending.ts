import { MONTHS } from './lib/config'
import { PiChart } from './lib/pi_chart'
import { Group } from './lib/transaction'
import { ReportType, create_report } from './lib/report'
import { $ } from './lib/util'

let spending: PiChart
let current_week: Date

async function report_for_week(date: Date): Promise<Map<Group, number>>
{
    const start = new Date(date.valueOf())
    start.setDate(date.getDate() - date.getDay())

    const end = new Date(date.valueOf())
    end.setDate(start.getDate() + 7)

    const report = await create_report(start, end, ReportType.CATEGORY)
    if (report.size == 0)
        report.set({ name: 'Nothing', color: 0xFFF }, 0)

    return report
}

async function load_week(date: Date)
{
    const month = MONTHS[date.getMonth()]
    const week_num = Math.floor(date.getDate() / 7)
    $('#week-display').innerHTML = `${ month } Week ${ week_num + 1 }`

    const data = await report_for_week(date)
    spending.set_data(data)
}

window.onload = async () =>
{
    spending = new PiChart($('#spending') as HTMLDivElement)
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
