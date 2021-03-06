import { Category, Place, Transaction } from './lib/transaction'
import { format_money, MONTHS, WEEK_DAYS } from './lib/config'
import { calculate_total_net_budget } from './lib/budget'
import { $, get_week } from './lib/util'
import { DataBase } from './lib/database'

function ordinal(x: number): string
{
    const str = x.toString()
    if (str.length == 0)
        return ''

    const last = str.charAt(str.length - 1)
    switch (last)
    {
        case '1': 
            if (str == '11') {
              return str + "th"
            } else { 
                return str + 'st'
            }
        case '2':
            if (str == '12') {
                return str + "th"
            } else { 
                return str + 'nd'
            }
        case '3': 
            if (str == '13') {
                return str + "th"
            } else { 
                return str + 'rd'
            }
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
    day_div.id = absolute_day_id(day).toString()
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
            <i class="fa fa-trash-o button" aria-hidden="true" id="remove"></i>
        `

        item.querySelector<HTMLElement>('#remove').onclick = async () =>
        {
            await DataBase.the().remove('transactions', transaction.timestamp)
            await DataBase.the().remove('budget-cache', IDBKeyRange.lowerBound(get_week(transaction.timestamp)))
            await load_year(parseInt($('#year-display').innerHTML))
        }

        items.appendChild(item)
    })

    if (futures.length > 0)
        await Promise.all(futures)
    return day_div
}

function transactions_in_day(transactions: Transaction[], date: Date): Transaction[]
{
    const start = new Date(date.valueOf())
    const end = new Date(date.valueOf())
    start.setHours(0, 0, 0, 0)
    end.setHours(24, 0, 0, 0)
    return transactions.filter(x => x.timestamp >= start && x.timestamp < end)
}

async function create_week(start: Date, transactions: Transaction[]): Promise<HTMLDivElement>
{
    const [budget_left, total_spent] = await calculate_total_net_budget(start)

    const month = MONTHS[start.getMonth()]
    const week_num = Math.floor(start.getDate() / 7)
    const week_div = document.createElement('div')
    week_div.className = 'week'
    week_div.innerHTML = `
        <h1>${ month } Week ${ week_num + 1 }</h1>
        <div id="day-container"></div>
        <text>Total: ${ await format_money(total_spent) }</text>
        <text style="${ budget_left == null ? 'color: #666' : '' }">
            Budget Left: 
            <text style="
            ${ 
                budget_left != null 
                ? 'color: ' + (budget_left < 0 ? 'red' : 'green')
                : '' 
            }">
                ${ budget_left != null ? await format_money(budget_left) : 'N/A' }
            </text>
        </text>
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

async function load_year(year: number)
{
    $('#year-display').innerHTML = year.toString()
    const weeks: HTMLDivElement[] = []

    let date = new Date(Date.now())
    date.setHours(0, 0, 0, 0)
    date.setFullYear(year)
    date.setMonth(0, 1)

    const transactions = await transactions_in_year(date)
    let day_in_year = 0
    while (day_in_year < 364 + 7)
    {
        const week_div = await create_week(date, transactions)
        weeks.push(week_div)
        date.setDate(date.getDate() + 7 - date.getDay())
        day_in_year += 7 - date.getDay()
    }

    $('#transaction-view').innerHTML = ''
    weeks.forEach(x => $('#transaction-view').appendChild(x))
}

function scroll_to_now()
{
    let day = new Date(Date.now())
    day.setDate(day.getDate() - 7)

    let id = absolute_day_id(day).toString()
    $(`[id='${ id }']`).scrollIntoView()
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
        $('#category-input').appendChild(category)
    })

    const places = await Place.get_all()
    places.forEach(x => 
    {
        const place = document.createElement('option')
        place.innerHTML = x.name
        $('#place-input').appendChild(place)
    })
}

window.onload = async () =>
{
    $('#back-a-year').onclick = back_a_year
    $('#forward-a-year').onclick = forward_a_year
    $('#add-transaction').onclick = add_transaction
    $('#add-transaction-cancel').onclick = add_transaction_cancel
    $('#add-transaction-add').onclick = add_transaction_add
    load_groups()

    await load_year(get_current_year())
    scroll_to_now()
}

async function back_a_year()
{
    const year = parseInt($('#year-display').innerHTML) - 1
    await load_year(year)
}

async function forward_a_year()
{
    const year = parseInt($('#year-display').innerHTML) + 1
    await load_year(year)
}

function add_transaction()
{
    $('#add-transaction-div').style.display = 'block'
}

function add_transaction_cancel()
{
    $('#add-transaction-div').style.display = 'none'
}

async function add_transaction_add()
{
    const amount = parseFloat($('#amount-input').value)
    const category = await Category.get($('#category-input').value)
    const type = $('#type-input').value
    const place = await Place.get($('#place-input').value)

    let date = new Date($('#date-input').value)
    if (isNaN(date.getTime()))
        date = new Date(Date.now())

    if (!isNaN(amount) && category != null && place != null && amount != 0)
    {
        await Transaction.new(type == 'Spend' ? amount : -amount, category, place, date)
        await DataBase.the().remove('budget-cache', IDBKeyRange.lowerBound(get_week(date)))
        await load_year(parseInt($('#year-display').innerHTML))
        $('#add-transaction-div').style.display = 'none'
    }
}
