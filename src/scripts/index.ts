import { calculate_total_net_budget } from './lib/budget';
import {Category, Place} from "./lib/transaction";

if ('serviceWorker' in navigator) 
{
    navigator.serviceWorker
        .register('/service_worker.js')
        .then(() => console.log('Service Worker Registered'))
}

window.addEventListener('beforeinstallprompt', e => 
{
    console.log(`'beforeinstallprompt' event was fired.`);
})

window.onload = async () =>
{
    console.log(await calculate_total_net_budget())
    let p = await Place.get_all();
    if (p.length === 0) {
        Place.new("Supermarket", 0x10ccc7)
        Place.new("House", 0x69f542)
    }
    let c = await Category.get_all();
    if (c.length === 0) {
        Category.new("Food", 0xb31abd)
        Category.new("Drink", 0x0918f0)
        Category.new("Bills", 0xd01616)
    }
}
