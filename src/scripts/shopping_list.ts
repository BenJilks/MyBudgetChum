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

window.onload = () =>
{
    $('#complete-button').onclick = async () =>
    {
        $('#shopping-list').childNodes.forEach(item =>
        {
            const selected = item.querySelector('#selected')
            if (selected.checked)
            {
                selected.checked = false
                item.className = 'item'
            }
        })

        await Transaction.new(
            total, 
            await Category.get('Food'), 
            await Place.get('Supermarket'))

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
            const price = parseInt($('#price-input').value)
            const item = { name: name, price: price, count: 0 }
            await DataBase.the().insert('shopping-item', item)

            $('#item-list').appendChild(await create_item(item))
            $('#add-item-div').style.display = 'none'
            update_shopping_list()
        }
    }

    load_items()
}
