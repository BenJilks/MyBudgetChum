import { Config, format_money, get_monthly_budget } from "./lib/config"
import { ReportType, create_report } from "./lib/report"
import { Category, Group, Transaction } from "./lib/transaction"
import { $, color_from_number } from "./lib/util"

if ('serviceWorker' in navigator) 
{
    navigator.serviceWorker
        .register('/service_worker.js')
        .then(() => console.log('Service Worker Registered'))
}

window.addEventListener('beforeinstallprompt', e => 
{
    console.log(`'beforeinstallprompt' event was fired.`)
})

async function load_top_categories(start: Date, end: Date)
{
    // Find heigest areas of spending
    const report = await create_report(start, end, ReportType.CATEGORY)
    const top_categories = Array
        .from(report.entries())
        .sort(([_, a], [__, b]) => a - b)
        .reverse()
    
    // Get list of 0s it there's not enough categories with > 0 value
    const other_categories = (await Category.get_all())
        .filter(x => top_categories.find(y => y[0].name == x.name) == undefined)

    for (let i = 0; i < 4; i++)
    {
        let category: Group = null
        let amount = 0

        if (i < top_categories.length)
            [category, amount] = top_categories[i]
        else
            category = other_categories[i - top_categories.length]
        
        if (category == undefined)
            break
        
        const category_div = document.createElement('div')
        category_div.className = 'button'
        category_div.style.backgroundColor = color_from_number(category.color)
        category_div.innerHTML = `
            <h1>${ category.name }</h1>
            <h2>${ await format_money(amount) }</h2>
        `
        $('#top-categories').appendChild(category_div)
    }
}

async function load_budget_overview(start: Date, end: Date)
{
    // Fetch monthly budget information
    const budget = await get_monthly_budget()
    const transaction_last_month = await Transaction.get_in_range(start, end)
    const total_spendings = transaction_last_month.reduce((total, x) => total += x.amount, 0)

    // Display it
    $('#monthly-budget').innerHTML = await format_money(budget)
    $('#total-spendings').innerHTML = await format_money(total_spendings)
}

window.onload = async () =>
{
    // Check to see if this is the uses's first time using the app, 
    // if so send to setup page and mark that we've done so.
    const first_time = await Config.the().get('first_time')
    if (first_time != 'no')
    {
        await Config.the().set('first_time', 'no')
        window.location.href = 'settings.html'
        return
    }

    // Get the start and end dates of the last month
    const start = new Date(Date.now())
    const end = new Date(Date.now())
    start.setDate(start.getDate() - 30)
    
    // Load page data
    load_top_categories(start, end)
    load_budget_overview(start, end)
}
