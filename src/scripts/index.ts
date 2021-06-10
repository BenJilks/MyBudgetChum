import { calculate_budget_left } from './lib/budget'
import {Category, Place} from "./lib/transaction";

window.onload = async () =>
{
    console.log(await calculate_budget_left(new Date(Date.now())))
    let p = await Place.get_all();
    if (p.length === 0) {
        Place.new("Supermarket", 0x10ccc7)
    }
    let c = await Category.get_all();
    if (c.length === 0) {
        Category.new("Food", 0xb31abd)
        Category.new("Drink", 0x0918f0)
        Category.new("Bills", 0xd01616)
    }
}


