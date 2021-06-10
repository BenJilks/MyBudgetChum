import { CURRENCIES, Config } from './lib/config'
import { $ } from './lib/util'

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

window.onload = async () =>
{
    load_currencies()

    const currency = await Config.the().get('currency')
    $('#currency').value = currency
    $('#currency').onchange = select_currency
    $('#budgettxt').innerHTML = CURRENCIES.get(currency).symbol
}

async function select_currency()
{
    const currency = $('#currency').value
    $('#budgettxt').innerHTML = CURRENCIES.get(currency).symbol

    await Config.the().set('currency', currency)
}
