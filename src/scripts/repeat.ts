import {MONTHS, WEEK_DAYS} from './lib/config'
import {Category, Place} from './lib/transaction'
import {Repeat, RepeatTimer, RepeatType} from './lib/repeat'
import {DataBase} from './lib/database'
import {$} from './lib/util'

let repeat_editing: number

function create_repeat(repeat: Repeat): HTMLDivElement
{
    const repeat_div = document.createElement('div')
    repeat_div.className = 'item'
    repeat_div.innerHTML = `
        <text class="name">${ repeat.name }</text>
        <i class="fa fa-pencil button" aria-hidden="true" id="edit"></i>
        <i class="fa fa-trash-o button" aria-hidden="true" id="remove"></i>
    `

    repeat_div.querySelector<HTMLElement>('#edit').onclick = () => edit(repeat.id)
    repeat_div.querySelector<HTMLElement>('#remove').onclick = () => remove(repeat.id)
    return repeat_div
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
    $('#period-input').onchange = period_select
    $('#add-repeat').onclick = add_repeat
    $('#add-repeat-cancel').onclick = add_repeat_cancel
    $('#add-repeat-add').onclick = add_repeat_add

    load_groups()
    load_repeat_list()
}

function period_select()
{
    switch ($('#period-input').value)
    {
        case 'Daily':
            $('#month_day').style.display = 'none'
            $('#week_day').style.display = 'none'
            $('#month').style.display = 'none'
            break

        case 'Weekly':
            $('#month_day').style.display = 'none'
            $('#week_day').style.display = 'flex'
            $('#month').style.display = 'none'
            break
        
        case 'Monthly':
            $('#month_day').style.display = 'flex'
            $('#week_day').style.display = 'none'
            $('#month').style.display = 'none'
            break
    
        case 'Yearly':
            $('#month_day').style.display = 'flex'
            $('#week_day').style.display = 'none'
            $('#month').style.display = 'flex'
            break
    }
}

function add_repeat()
{
    $('#add-repeat-add').innerHTML = 'Add'
    $('#add-repeat-div').style.display = 'block'
}

function add_repeat_cancel()
{
    $('#add-repeat-div').style.display = 'none'
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
    let success = false
    const name = $('#name-input').value
    const category = await Category.get($('#category-input').value)
    const place = await Place.get($('#place-input').value)
    const amount = parseInt($('#amount-input').value)
    const period = period_to_repeat_type($('#period-input').value)
    const hour = parseInt($('#hour-input').value)
    const month_day = parseInt($('#month-day-input').value)
    const week_day = WEEK_DAYS.indexOf($('#week-day-input').value)
    const month = MONTHS.indexOf($('#month-input').value)

    const timer = new RepeatTimer({ 
        type: period, hour: hour, month_day: month_day, 
        week_day: week_day, month: month 
    });
    if ((name.length != 0)&&(category != null)&&(place != null)&&(!isNaN(amount))&&(period != null)&&(!isNaN(hour))&&(amount != 0)&&(hour > 0)&&(hour < 25)) {
        if (repeat_editing == null) {
            if ((RepeatType.MONTHLY)||(RepeatType.YEARLY)) {
                if (!isNaN(month_day)&&(month_day > 0)&&(month_day < 32)) {
                    await Repeat.new(name, amount, category, place, timer)
                   success = true
                }
            }
            else {
                await Repeat.new(name, amount, category, place, timer)
                success = true
            }
        }
        else {
                await Repeat.update(repeat_editing, name, amount, category, place, timer)
                success = true
            }
        }

    if (success) {
        await load_repeat_list()
        repeat_editing = null
        $('#add-repeat-div').style.display = 'none'
        success = false
    }
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
    $('#name-input').value = repeat.name
    $('#category-input').value = repeat.category.name
    $('#place-input').value = repeat.place.name
    $('#amount-input').value = repeat.amount.toString()
    $('#period-input').value = capatilise_first_letter(RepeatType[repeat.timer.type])
    $('#hour-input').value = repeat.timer.hour.toString()
    $('#month-day-input').value = repeat.timer.month_day.toString()
    $('#week-day-input').value = WEEK_DAYS[repeat.timer.week_day]
    $('#month-input').value = MONTHS[repeat.timer.month]
    period_select()

    repeat_editing = id
    $('#add-repeat-add').innerHTML = 'Save'
    $('#add-repeat-div').style.display = 'block'
}
