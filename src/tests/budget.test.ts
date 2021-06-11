import { Category, Place, Transaction } from '../scripts/lib/transaction'
import { calculate_total_net_budget } from '../scripts/lib/budget'

require("fake-indexeddb/auto")

test('budget', async () =>
{
    calculate_total_net_budget();

    expect(5).toBe(5); //example test
})
