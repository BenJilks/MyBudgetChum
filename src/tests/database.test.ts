import { Category, Place, Transaction } from '../scripts/transaction'

require("fake-indexeddb/auto")
test('groups', async () =>
{
    await Promise.all(
    [
        Category.new('drink', 0xFF0000),
        Category.new('food', 0x00FF00),
        Place.new('coop', 0xFF0000),
        Place.new('spoons', 0x00FF00),
    ])

    const categories = await Category.get_all()
    expect(categories[0].name).toBe('drink')
    expect(categories[0].color).toBe(0xFF0000)
    expect(categories[1].name).toBe('food')
    expect(categories[1].color).toBe(0x00FF00)

    const places = await Place.get_all()
    expect(places[0].name).toBe('coop')
    expect(places[0].color).toBe(0xFF0000)
    expect(places[1].name).toBe('spoons')
    expect(places[1].color).toBe(0x00FF00)

    await Promise.all(
    [
        Transaction.new(1.4, categories[0], places[1], new Date(2001, 1, 1)),
        Transaction.new(-63, categories[1], places[0], new Date(2001, 1, 5)),
    ])

    const transactions = await Transaction.get_in_range(new Date(2001, 1, 1), new Date(2001, 2, 1))
    expect(transactions).toStrictEqual(await Transaction.get_all())
    expect(transactions.length).toBe(2)
    expect(transactions[0].amount).toBe(1.4)
    expect(transactions[1].amount).toBe(-63)

    const first = await Transaction.get_in_range(new Date(2001, 1, 1), new Date(2001, 1, 2))
    expect(first.length).toBe(1)
    expect(first[0].amount).toBe(1.4)

    const second = await Transaction.get_in_range(new Date(2001, 1, 2), new Date(2003, 1, 1))
    expect(second.length).toBe(1)
    expect(second[0].amount).toBe(-63)
})
