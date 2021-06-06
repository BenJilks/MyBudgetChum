import { Category, Place } from '../scripts/transaction'

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
})
