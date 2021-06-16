import { Category, Place, Transaction } from '../scripts/lib/transaction'
import { calculate_total_net_budget } from '../scripts/lib/budget'
import { Config } from '../scripts/lib/config'
import { DataBase } from '../scripts/lib/database'

require("fake-indexeddb/auto")

test('budget', async () =>
{
    const now = new Date(Date.now())
    console.log("CURRENT DATE: " + now);
    await Config.the().set('budget', '30');

    /* TEST 1 */
    //clear cache
    await DataBase.the().remove('budget-cache', 
    IDBKeyRange.lowerBound(new Date(0))) 

    //test to see if net_budget_left capped at 2*budget (60)
    await Transaction.new(10, {name: 'Drink', color: 0}, {name: 'House', color: 0}, new Date(2021,4,30));

    let [net_budget_left, week_total] = await calculate_total_net_budget(now);
    expect(net_budget_left).toBe(60);
    expect(week_total).toBe(0);
    console.log("End of test 1\n\n");
    /* END OF TEST 1 */

    /* TEST 2 */
    //clear cache
    await DataBase.the().remove('budget-cache', 
    IDBKeyRange.lowerBound(new Date(0)))

    //test to add more transactions
    await Transaction.new(15, {name: 'Bills', color: 0}, {name: 'Supermarket', color: 0}, new Date(2021,5,2));
    await Transaction.new(15, {name: 'Food', color: 0}, {name: 'House', color: 0}, new Date(2021,5,3));
    [net_budget_left, week_total] = await calculate_total_net_budget(now);
    expect(net_budget_left).toBe(50);
    expect(week_total).toBe(0);
    console.log("End of test 2\n\n");
    /* END OF TEST 2 */

    /* TEST 3 */
    //clear cache
    await DataBase.the().remove('budget-cache', 
    IDBKeyRange.lowerBound(new Date(0)))

    //test to add a transaction at present time and in current week
    await Transaction.new(15, {name: 'Drink', color: 0}, {name: 'Spoons', color: 0}, new Date(Date.now()));
    await Transaction.new(30, {name: 'Food', color: 0}, {name: 'Supermarket', color: 0}, new Date(2021,5,15));
    
    [net_budget_left, week_total] = await calculate_total_net_budget(now);
    expect(net_budget_left).toBe(5);
    expect(week_total).toBe(45);
    console.log("End of test #3\n\n");
    /* END OF TEST 3 */

})
