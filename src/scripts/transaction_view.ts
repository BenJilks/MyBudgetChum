import { Transaction } from './transaction'
import { format_money } from './config'

let transaction_view: HTMLElement
let year_display: HTMLElement

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

async function create_day(day: Date, transactions: Transaction[]): Promise<HTMLDivElement>
{
    const day_string = get_day_string(day)
    const day_div = document.createElement('div')
    day_div.className = 'day'
    day_div.id = day_string
    day_div.innerHTML = `
        <h1>${ day_string }</h1>
        <div id="items"></div>
    `

    const items = day_div.querySelector('#items')
    const futures: Promise<string>[] = []
    transactions.forEach(async transaction =>
    {
        const format_future = format_money(transaction.amount)
        futures.push(format_future)

        const item = document.createElement('div')
        item.innerHTML = `
            <text id="place">${ transaction.place.name }</text>
            <text id="amount">${ await format_future }</text>
        `
        items.appendChild(item)
    })

    if (futures.length > 0)
        await Promise.all(futures)
    return day_div
}

function transactions_in_year(start: Date): Promise<Transaction[]>
{
    let end = new Date(start.valueOf())
    end.setMonth(12, 31)
    return Transaction.get_in_range(start, end)
}

function transactions_in_day(transactions: Transaction[], date: Date): Transaction[]
{
    const start = new Date(date.valueOf())
    const end = new Date(date.valueOf())
    start.setHours(0)
    end.setHours(24)
    return transactions.filter(x => x.timestamp >= start && x.timestamp < end)
}

async function load_year(year: number)
{
    year_display.innerHTML = year.toString()
    const temp_transaction_container = document.createElement('div')

    let date = new Date(Date.now())
    date.setFullYear(year)
    date.setMonth(0, 1)

    const transactions = await transactions_in_year(date)
    for (let i = 0; i < 365; i++)
    {
        const day_transactions = transactions_in_day(transactions, date)
        temp_transaction_container.appendChild(await create_day(date, day_transactions))
        date.setDate(date.getDate() + 1)
    }

    transaction_view.innerHTML = temp_transaction_container.innerHTML
}

function scroll_to_now()
{
    let now = new Date(Date.now())
    now.setDate(now.getDate() - 3)

    const now_div: Element = transaction_view.querySelector(
        `[id='${ get_day_string(now) }']`)
    now_div.scrollIntoView()
}

function get_current_year()
{
    return new Date(Date.now()).getFullYear()
}

window.onload = async () =>
{
    transaction_view = document.getElementById('transaction-view')
    year_display = document.getElementById('year-display')
    if (window == null)
    {
        back_a_year()
        forward_a_year()
    }

    await load_year(get_current_year())
    scroll_to_now()
}

async function back_a_year()
{
    const year = parseInt(year_display.innerHTML) - 1
    await load_year(year)
}

async function forward_a_year()
{
    const year = parseInt(year_display.innerHTML) + 1
    await load_year(year)
}
