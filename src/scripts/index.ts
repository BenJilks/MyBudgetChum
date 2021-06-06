
window.onload = async () =>
{
    try
    {
        const food = await Category.new('food', 0xFF0000)
        const coop = await Place.new('coop', 0x00FF00)
        await Repeat.new(2.50, food, coop, new RepeatTimer({ 'type': RepeatType.DAILY }))
    }
    catch
    {
        console.log('Already added test repeat')
    }

    const repeats = await Repeat.get_all()
    repeats.forEach(async item =>
    {
        console.log(item)
        console.log(await item.trigger_if_timer_condition_is_met())
    })

    const bar_chart = new BarChart(document.getElementById('bar-chart') as HTMLDivElement)
    bar_chart.set_data([1, 2, -4, 5, -5, 4, 2, 0, 7, -2])
}
