import { DataBase } from './database';
import { Transaction } from './transaction'
import { get_weekly_budget } from './config'
import { get_week } from './util'

async function get_cache(week: Date): Promise<number>
{
    const cache = await DataBase.the().get('budget-cache', week)
    if (cache.length == 0)
        return null
    
    return cache[0].amount
}

async function set_cache(week: Date, amount: number)
{
    const item = { week: week, amount: amount }
    await DataBase.the().update('budget-cache', item)
}

export async function calculate_weekly_total(start: Date): Promise<number>
{
    const end = new Date(start.valueOf())
    end.setDate(start.getDate() + 7)

    const transactions = await Transaction.get_in_range(start, end)
    let total_spent = 
        transactions.reduce((total, x) => total += x.amount, 0)
    
    return total_spent
}

export async function calculate_total_net_budget(date: Date): Promise<[number, number]>
{
    // If this week is in the future, there's no need to calculate a budget
    const this_week = get_week(new Date(Date.now()))
    const end_of_budget = get_week(date)
    if (end_of_budget > this_week)
        return [null, 0]
 
    // Get first transaction
    const first_transaction = await Transaction.get_first()
    if (first_transaction == null || first_transaction == undefined)
        return [null, 0]
        
    // If this week is before the first transaction, no need to calculate anything
    const start_of_budget = get_week(first_transaction.timestamp)
    if (end_of_budget < start_of_budget)
        return [null, 0]

    let current_week = new Date(end_of_budget.valueOf())
    let net_budget_left = 0

    // Loop through each week backwards to find the latest cached week
    while (current_week >= start_of_budget)
    {
        // Check for a cache, if we find one, set our net bedget 
         // left to it for a starting point.
        let cache = await get_cache(current_week)
        if (cache != null)
        {
            net_budget_left = cache
            break
        }

        // Decrement date to the last week
        current_week.setDate(current_week.getDate() - 7)
    }

    // Loop forward through each non cached week
    const weekly_budget = await get_weekly_budget()
    while (current_week < end_of_budget)
    {
        current_week.setDate(current_week.getDate() + 7)

        const week_total = await calculate_weekly_total(current_week)
        net_budget_left += weekly_budget - week_total
        if (current_week < this_week)
            await set_cache(current_week, net_budget_left)
    }

    const week_total = await calculate_weekly_total(end_of_budget)
    return [net_budget_left, week_total]
}
