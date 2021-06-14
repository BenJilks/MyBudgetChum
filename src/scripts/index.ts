import { format_money, get_monthly_budget } from "./lib/config"
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

async function load_top_categories()
{
    const start = new Date(Date.now())
    const end = new Date(Date.now())
    start.setMonth(start.getMonth() - 1)
    
    const report = await create_report(start, end, ReportType.CATEGORY)
    const top_categories = Array
        .from(report.entries())
        .sort(([_, a], [__, b]) => a - b)
        .reverse()
    
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
            <h4>${ await format_money(amount) }</h4>
        `
        $('#top-categories').appendChild(category_div)
    }
}

async function load_budget_overview()
{
    const budget = await get_monthly_budget()

    const start = new Date(Date.now())
    const end = new Date(Date.now())
    start.setMonth(start.getMonth() - 1)

    const transaction_last_month = await Transaction.get_in_range(start, end)
    const total_spendings = transaction_last_month.reduce((total, x) => total += x.amount, 0)

    $('#monthly-budget').innerHTML = await format_money(budget)
    $('#total-spendings').innerHTML = await format_money(total_spendings)
}

window.onload = async () =>
{
    load_top_categories()
    load_budget_overview()
}
