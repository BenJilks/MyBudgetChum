import { WEEK_DAYS, MONTHS } from './lib/config'
import { Category, Place, Transaction } from './lib/transaction'
import { Repeat, RepeatTimer, RepeatType } from './lib/repeat'
import { DataBase } from './lib/database'

let add_repeat_div: HTMLElement
let name_input: HTMLInputElement
let category_input: HTMLSelectElement
let place_input: HTMLSelectElement
let amount_input: HTMLInputElement
let period_input: HTMLSelectElement
let hour_input: HTMLInputElement
let month_day_input: HTMLInputElement
let week_day_input: HTMLSelectElement
let month_input: HTMLSelectElement

let add_button: HTMLButtonElement
let repeat_editing: number

function create_repeat(repeat: Repeat): HTMLDivElement
{
    const repeat_div = document.createElement('div')
    repeat_div.className = 'repeat'
    repeat_div.innerHTML = `
        <text id="name">${ repeat.name }</text>
        <i class="fa fa-pencil" aria-hidden="true" onclick="edit(${ repeat.id })"></i>
        <i class="fa fa-trash-o" aria-hidden="true" onclick="remove(${ repeat.id })"></i>
    `

    return repeat_div
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

async function load_repeat_list()
{
    const repeat_list = document.getElementById('repeat-list')
    repeat_list.innerHTML = ''

    const repeats = await Repeat.get_all()
    repeats.forEach(x => 
    {
        const repeat_div = create_repeat(x)
        repeat_list.appendChild(repeat_div)
    })
}

window.onload = async () =>
{
    add_repeat_div = document.getElementById('add-repeat')
    name_input = document.getElementById('name-input') as HTMLInputElement
    category_input = document.getElementById('category-input') as HTMLSelectElement
    place_input = document.getElementById('place-input') as HTMLSelectElement
    amount_input = document.getElementById('amount-input') as HTMLInputElement
    period_input = document.getElementById('period-input') as HTMLSelectElement
    hour_input = document.getElementById('hour-input') as HTMLInputElement
    month_day_input = document.getElementById('month-day-input') as HTMLInputElement
    week_day_input = document.getElementById('week-day-input') as HTMLSelectElement
    month_input = document.getElementById('month-input') as HTMLSelectElement

    add_button = document.getElementById('add-button') as HTMLButtonElement

    if (window == null)
    {
        period_select()
        add_repeat()
        add_repeat_cancel()
        add_repeat_add()
        remove(null)
        edit(null)
    }

    load_groups()
    load_repeat_list()
}

function period_select()
{
    switch (period_input.value)
    {
        case 'Daily':
            document.getElementById('month_day').style.display = 'none'
            document.getElementById('week_day').style.display = 'none'
            document.getElementById('month').style.display = 'none'
            break

        case 'Weekly':
            document.getElementById('month_day').style.display = 'none'
            document.getElementById('week_day').style.display = 'flex'
            document.getElementById('month').style.display = 'none'
            break
        
        case 'Monthly':
            document.getElementById('month_day').style.display = 'flex'
            document.getElementById('week_day').style.display = 'none'
            document.getElementById('month').style.display = 'none'
            break
    
        case 'Yearly':
            document.getElementById('month_day').style.display = 'flex'
            document.getElementById('week_day').style.display = 'none'
            document.getElementById('month').style.display = 'flex'
            break
    }
}

function add_repeat()
{
    add_button.innerHTML = 'Add'
    add_repeat_div.style.display = 'block'
}

function add_repeat_cancel()
{
    add_repeat_div.style.display = 'none'
}

function period_to_repeat_type(period: string): RepeatType
{
    switch (period)
    {
        case 'Daily': 
            return RepeatType.DAILY
        case 'Weekly': 
            return RepeatType.WEEKLY
        case 'Monthly': 
            return RepeatType.MONTHLY
        case 'Yearly': 
            return RepeatType.YEARLY
    }
}

async function add_repeat_add()
{
    const name = name_input.value
    const category = await Category.get(category_input.value)
    const place = await Place.get(place_input.value)
    const amount = parseInt(amount_input.value)
    const period = period_to_repeat_type(period_input.value)
    const hour = parseInt(hour_input.value)
    const month_day = parseInt(month_day_input.value)
    const week_day = WEEK_DAYS.indexOf(week_day_input.value)
    const month = MONTHS.indexOf(month_input.value)

    const timer = new RepeatTimer({ 
        type: period, hour: hour, month_day: month_day, 
        week_day: week_day, month: month 
    });

    if (repeat_editing == null)
        await Repeat.new(name, amount, category, place, timer)
    else
        await Repeat.update(repeat_editing, name, amount, category, place, timer)
        
    await load_repeat_list()
    repeat_editing = null
    add_repeat_div.style.display = 'none'
}

async function remove(id: number)
{
    await DataBase.the().remove('repeat', id)
    await load_repeat_list()
}

function capatilise_first_letter(str: string): string
{
    let out = str.toLowerCase()
    return out.charAt(0).toUpperCase() + out.substr(1)
}

async function edit(id: number)
{
    const repeat = await Repeat.get(id)
    name_input.value = repeat.name
    category_input.value = repeat.category.name
    place_input.value = repeat.place.name
    amount_input.value = repeat.amount.toString()
    period_input.value = capatilise_first_letter(RepeatType[repeat.timer.type])
    hour_input.value = repeat.timer.hour.toString()
    month_day_input.value = repeat.timer.month_day.toString()
    week_day_input.value = WEEK_DAYS[repeat.timer.week_day]
    month_input.value = MONTHS[repeat.timer.month]
    period_select()

    repeat_editing = id
    add_button.innerHTML = 'Save'
    add_repeat_div.style.display = 'block'
}
