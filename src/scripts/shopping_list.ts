import { DataBase } from './lib/database'
import { format_money } from './lib/config'
import { $ } from './lib/util'
import { Category, Place, Transaction } from './lib/transaction'

let total = 0

async function create_item(item: object): Promise<HTMLDivElement>
{
    let count = item['count']

    const item_div = document.createElement('div')
    item_div.className = 'item'
    item_div.innerHTML = `
        <text class="name">${ item['name'] } (${ await format_money(item['price']) })</text>
        <i class="fa fa-minus button" aria-hidden="true" id="dec"></i>
        <text class="button" id="count">${ count }</text>
        <i class="fa fa-plus button" aria-hidden="true" id="inc"></i>
    `

    item_div.querySelector<HTMLElement>('#inc').onclick = async () => 
    {
        item_div.querySelector('#count').innerHTML = (++count).toString()

        item['count'] = count
        await DataBase.the().update('shopping-item', item)
        update_shopping_list()
    }
    
    item_div.querySelector<HTMLElement>('#dec').onclick = async () => 
    {
        count = Math.max(count - 1, 0)
        item_div.querySelector('#count').innerHTML = count.toString()

        item['count'] = count
        await DataBase.the().update('shopping-item', item)
        update_shopping_list()
    }
    return item_div
}

function create_shopping_list_item(item: object): HTMLDivElement
{
    const item_div = document.createElement('div')
    item_div.className = 'item'
    item_div.id = JSON.stringify(item)
    item_div.innerHTML = `
        <text class="name">
            ${ item['name'] } 
            ${ item['count'] > 1 ? `(x${ item['count'] })` : '' }
        </text>
        <input type="checkbox" id="selected" />
    `

    item_div.onclick = async () =>
    {
        const selected = item_div.querySelector<HTMLInputElement>('#selected')
        selected.checked = !selected.checked

        if (selected.checked)
        {
            item_div.className = 'item checked'
            total += item['price'] * item['count']
        }
        else 
        {
            item_div.className = 'item'
            total -= item['price'] * item['count']
        }
        $('#total').innerHTML = `Total: ${ await format_money(total) }`
    }

    return item_div
}

async function load_items()
{
    const items = await DataBase.the().get('shopping-item')
    items.forEach(async (item: object) => 
    {
        $('#item-list').appendChild(await create_item(item))

        if (item['count'] > 0)
            $('#shopping-list').appendChild(await create_shopping_list_item(item))
    })

    $('#total').innerHTML = `Total: ${ await format_money(total) }`
}

async function update_shopping_list()
{
    $('#shopping-list').innerHTML = ''

    const items = await DataBase.the().get('shopping-item')
    items.forEach(async (item: object) => 
    {
        if (item['count'] > 0)
            $('#shopping-list').appendChild(await create_shopping_list_item(item))
    })
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

window.onload = () =>
{
    $('#complete-button').onclick = async () =>
    {
        let transactions = new Map<string, number>()
        $('#shopping-list').childNodes.forEach(item_div =>
        {
            const selected = item_div.querySelector('#selected')
            if (selected.checked)
            {
                selected.checked = false
                item_div.className = 'item'

                const item: object = JSON.parse(item_div.id)
                const id = JSON.stringify([item['category'], item['place']])
                const total = transactions.get(id) ?? 0
                transactions.set(id, total + item['price'] * item['count'])
            }
        })

        if (transactions.size == 0)
            return

        transactions.forEach(async (total, id) =>
        {
            const [category, place] = JSON.parse(id)
            await Transaction.new(total, 
                await Category.get(category), 
                await Place.get(place))
        })
        window.location.href = 'transaction_view.html'
    }

    $('#edit-button').onclick = () =>
    {
        $('#edit-screen').style.display = 'block'
        $('#fade-overlay').style.display = 'block'
    }

    $('#done-button').onclick = () =>
    {
        $('#edit-screen').style.display = 'none'
        $('#fade-overlay').style.display = 'none'
    }

    $('#new-button').onclick = () =>
    {
        $('#add-item-div').style.display = 'block'

        $('#add-item-cancel').onclick = () =>
        {
            $('#add-item-div').style.display = 'none'
        }

        $('#add-item-create').onclick = async () =>
        {
            const name = $('#name-input').value
            const price = $('#price-input').value
            const category = $('#category-input').value
            const place = $('#place-input').value

            if (!(name.length > 0 && price > 0))
                return

            const item = 
            { 
                name: name, 
                price: parseFloat(price), 
                category: category, 
                place: place,
                count: 0,
            }
    
            await DataBase.the().insert('shopping-item', item)
            $('#item-list').appendChild(await create_item(item))
            $('#add-item-div').style.display = 'none'
            update_shopping_list()
        }
    }

    load_items()
    load_groups()
}
