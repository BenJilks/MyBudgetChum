import { Category, Place, Transaction } from './transaction'
import { format_money } from './config'

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December'
]

function ordinal(x: number): string
{
    const str = x.toString()
    if (str.length == 0)
        return ''

    const last = str.charAt(str.length - 1)
    switch (last)
    {
        case '1': return str + 'st'
        case '2': return str + 'nd'
        case '3': return str + 'rd'
        default:
            return str + 'th'
    }
}

function get_day_string(day: Date): string
{
    return `${ ordinal(day.getDate()) } ${ MONTHS[day.getMonth()] }`
}

async function create_day(day: Date): Promise<HTMLDivElement>
{
    const day_string = get_day_string(day)
    const day_div = document.createElement('div')
    day_div.className = 'day'
    day_div.id = day_string
    day_div.innerHTML = `
        <h1>${ day_string }</h1>
        <div id="items"></div>
    `
    
    const start = new Date(day.valueOf())
    const end = new Date(day.valueOf())
    start.setHours(0)
    end.setHours(24)

    const items = day_div.querySelector('#items')
    const transactions = await Transaction.get_in_range(start, end)
    transactions.forEach(async transaction =>
    {
        const item = document.createElement('div')
        item.innerHTML = `
            <text id="place">${ transaction.place.name }</text>
            <text id="amount">${ await format_money(transaction.amount) }</text>
        `
        items.appendChild(item)
    })

    return day_div
}

window.onload = async () =>
{
    const transaction_view = document.getElementById('transaction-view')

    let date = new Date(Date.now())
    date.setMonth(0, 1)
    for (let i = 0; i < 365; i++)
    {
        transaction_view.appendChild(await create_day(date))
        date.setDate(date.getDate() + 1)
    }

    let now = new Date(Date.now())
    now.setDate(now.getDate() - 3)

    const now_div: Element = transaction_view.querySelector(
        `[id='${ get_day_string(now) }']`)
    now_div.scrollIntoView()
}
