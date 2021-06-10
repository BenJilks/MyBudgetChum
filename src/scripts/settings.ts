import { CURRENCIES, Config } from './lib/config'
import { Category, Group, Place } from './lib/transaction'
import { ReportType } from './lib/report'
import { $ } from './lib/util'
import { DataBase } from './lib/database'

let add_group_mode: ReportType

function load_currencies()
{
    CURRENCIES.forEach((currency, id) => 
    {
        const option = document.createElement('option')
        option.innerHTML = `${currency.symbol} (${ currency.full_name })`
        option.value = id
        $('#currency').appendChild(option)
    })
}

function create_group(type: ReportType, group: Group): HTMLDivElement
{
    const color = `#${ group.color.toString(16) }`
    const group_div = document.createElement('div')
    group_div.className = 'group'
    group_div.innerHTML = `
        <text id="name">${ group.name }</text>
        <div id="color-preview" style="background-color: ${ color }"></div>
        <i class="fa fa-trash-o" aria-hidden="true" id="remove"></i>
    `

    group_div.querySelector<HTMLElement>('#remove').onclick = 
        () => remove_group(type, group.name)
    return group_div
}

async function load_groups()
{
    $('#category-list').innerHTML = ''
    $('#place-list').innerHTML = ''

    const categories = await Category.get_all()
    categories.forEach(category =>
    {
        const group = create_group(ReportType.CATEGORY, category)
        $('#category-list').appendChild(group)
    })

    const places = await Place.get_all()
    places.forEach(place =>
    {
        const group = create_group(ReportType.PLACE, place)
        $('#place-list').appendChild(group)
    })
}

window.onload = async () =>
{
    load_currencies()
    load_groups()

    const currency = await Config.the().get('currency')
    $('#currency').value = currency
    $('#currency').onchange = select_currency
    $('#budgettxt').innerHTML = CURRENCIES.get(currency).symbol

    $('#add-category').onclick = add_category
    $('#add-place').onclick = add_place
    $('#add-group-cancel').onclick = add_group_cancel
    $('#add-group-add').onclick = add_group_add
}

async function select_currency()
{
    const currency = $('#currency').value
    $('#budgettxt').innerHTML = CURRENCIES.get(currency).symbol

    await Config.the().set('currency', currency)
}

async function remove_group(type: ReportType, name: string)
{
    switch (type)
    {
        case ReportType.CATEGORY:
            await DataBase.the().remove('categories', name)
            break
        
        case ReportType.PLACE:
            await DataBase.the().remove('places', name)
            break
    }

    load_groups()
}

function add_category()
{
    add_group_mode = ReportType.CATEGORY
    $('#add-group-title').innerHTML = 'Add Category'
    $('#add-group-div').style.display = 'block'
}

function add_place()
{
    add_group_mode = ReportType.PLACE
    $('#add-group-title').innerHTML = 'Add Place'
    $('#add-group-div').style.display = 'block'
}

function add_group_cancel()
{
    $('#add-group-div').style.display = 'none'
}

async function add_group_add()
{
    const name = $('#name-input').value
    const color = parseInt($('#color-input').value.substr(1), 16)
    console.log(color)

    switch (add_group_mode)
    {
        case ReportType.CATEGORY:
            await Category.new(name, color)
            break
        
        case ReportType.PLACE:
            await Place.new(name, color)
            break
    }
    await load_groups()

    $('#add-group-div').style.display = 'none'
}
