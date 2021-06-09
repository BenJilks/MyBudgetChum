import { Category, Place, Transaction } from './transaction'
import { format_money, MONTHS, WEEK_DAYS } from './config'

let transaction_view: HTMLElement
let year_display: HTMLElement

let add_transaction_div: HTMLElement
let category_input: HTMLSelectElement
let place_input: HTMLSelectElement
let amount_input: HTMLInputElement

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

function absolute_day_id(day: Date)
{
    return Math.floor(day.valueOf() / (1000 * 60 * 60 * 24)) - 3
}

function get_day_string(day: Date): string
{
    const week_day = WEEK_DAYS[day.getDay()]
    const date = ordinal(day.getDate())
    return `${ week_day } the ${ date }`
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
            <text id="place">${ transaction.place.name } (${ transaction.category.name })</text>
            <text id="amount">${ await format_future }</text>
        `
        items.appendChild(item)
    })

    if (futures.length > 0)
        await Promise.all(futures)
    return day_div
}

async function create_week(start: Date, transactions: Transaction[]): Promise<HTMLDivElement>
{
    const month = MONTHS[start.getMonth()]
    const week_num = Math.floor(start.getDate() / 7)
    const week_div = document.createElement('div')
    week_div.id = Math.floor(absolute_day_id(start) / 7).toString()
    week_div.className = 'week'
    week_div.innerHTML = `
        <h1>${ month } Week ${ week_num + 1 }</h1>
        <div id="day-container"></div>
        <text>total: {{ num }}</text>
        <text>budget left: {{ num }}</text>
    `

    const day_container = week_div.querySelector('#day-container')
    for (let i = 0; i < 7 - start.getDay(); i++)
    {
        const day = new Date(start.valueOf())
        day.setDate(start.getDate() + i)

        const day_transactions = transactions_in_day(transactions, day)
        const day_div = await create_day(day, day_transactions)
        day_container.appendChild(day_div)
    }

    return week_div
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
    let day_in_year = 0
    while (day_in_year < 364 + 7)
    {
        const week_div = await create_week(date, transactions)
        temp_transaction_container.appendChild(week_div)
        date.setDate(date.getDate() + 7 - date.getDay())
        day_in_year += 7 - date.getDay()
    }

    transaction_view.innerHTML = temp_transaction_container.innerHTML
}

function scroll_to_now()
{
    let now = Math.floor(absolute_day_id(new Date(Date.now())) / 7)
    const now_div: Element = transaction_view.querySelector(
        `[id='${ now }']`)
    now_div.scrollIntoView()
}

function get_current_year()
{
    return new Date(Date.now()).getFullYear()
}

async function load_groups()
{
    const categories = await Category.get_all()
    categories.forEach(x => 
    {
        const category = document.createElement('option')
        category.innerHTML = x.name
        category_input.appendChild(category)
    })

    const places = await Place.get_all()
    places.forEach(x => 
    {
        const place = document.createElement('option')
        place.innerHTML = x.name
        place_input.appendChild(place)
    })
}

window.onload = async () =>
{
    transaction_view = document.getElementById('transaction-view')
    year_display = document.getElementById('year-display')

    add_transaction_div = document.getElementById('add-transaction')
    category_input = document.getElementById('category-input') as HTMLSelectElement
    place_input = document.getElementById('place-input') as HTMLSelectElement
    amount_input = document.getElementById('amount-input') as HTMLInputElement

    if (window == null)
    {
        back_a_year()
        forward_a_year()
        add_transaction()
        add_transaction_cancel()
        add_transaction_add()
    }

    load_groups()

    await load_year(get_current_year())
    scroll_to_now()

    await Category.new('drink', 0xF00)
    await Place.new('spoons', 0xF00)
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

function add_transaction()
{
    add_transaction_div.style.display = 'block'
}

function add_transaction_cancel()
{
    add_transaction_div.style.display = 'none'
}

async function add_transaction_add()
{
    const amount = parseFloat(amount_input.value)
    const category = await Category.get(category_input.value)
    const place = await Place.get(place_input.value)

    await Transaction.new(amount, category, place)
    await load_year(parseInt(year_display.innerHTML))
    add_transaction_div.style.display = 'none'
}
