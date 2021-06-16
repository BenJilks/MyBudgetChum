import { CURRENCIES, Config } from './lib/config'
import { Category, Group, Place } from './lib/transaction'
import { ReportType } from './lib/report'
import { $, color_from_number } from './lib/util'
import { DataBase } from './lib/database'

let add_group_mode: ReportType

async function load_budget()
{
    const budget = (await Config.the().get('budget')) ?? "0"
    const is_monthly = (await Config.the().get('budget-is-monthly')) ?? "false"

    $('#budget').value = budget
    $('#monthly').checked = is_monthly == "true"
}

async function load_currencies()
{
    CURRENCIES.forEach((currency, id) => 
    {
        const option = document.createElement('option')
        option.innerHTML = `${currency.symbol} (${ currency.full_name })`
        option.value = id
        $('#currency').appendChild(option)
    })

    const currency = (await Config.the().get('currency')) ?? "SOL"
    $('#currency').value = currency
    $('#currency').onchange = select_currency
    $('#budgettxt').innerHTML = CURRENCIES.get(currency).symbol
}

function create_group(type: ReportType, group: Group): HTMLDivElement
{
    const color = color_from_number(group.color)
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
    load_budget()
    load_currencies()
    load_groups()

    $('#add-category').onclick = add_category
    $('#add-place').onclick = add_place
    $('#add-group-cancel').onclick = add_group_cancel
    $('#add-group-add').onclick = add_group_add
    $('#budget').onchange = update_budget
    $('#weekly').onchange = update_budget
    $('#monthly').onchange = update_budget

    $('#export-button').onclick = async () =>
    {
        const database = await DataBase.the().export()
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(database));
        element.setAttribute('download', 'mybudgetchum.json');
        element.style.display = 'none';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    $('#import-button').onchange = async () =>
    {
        const file = $('#import-button').files[0]
        if (file == null || file == undefined)
            return

        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = async event => 
        {
            await DataBase.the().import(event.target.result.toString())
            window.location.reload()
        }
    }

    $('#reset-button').onclick = async () =>
    {
        await DataBase.the().reset()
        window.location.reload()
    }
}

async function update_budget()
{
    const budget = $('#budget').value
    const is_monthly = $('#monthly').checked ? "true" : "false"
    await Config.the().set('budget', budget)
    await Config.the().set('budget-is-monthly', is_monthly)
    await DataBase.the().remove('budget-cache', IDBKeyRange.lowerBound(new Date(0)))
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
    console.log($('#color-input').value)

    switch (add_group_mode)
    {
        case ReportType.CATEGORY:
            if (name.length != 0) {
                await Category.new(name, color)
            }
            break
        
        case ReportType.PLACE:
            if (name.length != 0) {
                await Place.new(name, color)
            }
            break
    }
    await load_groups()

    $('#add-group-div').style.display = 'none'
}
