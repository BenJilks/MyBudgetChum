import { calculate_budget_left } from './lib/budget'

window.onload = async () =>
{
    console.log(await calculate_budget_left(new Date(Date.now())))
}
