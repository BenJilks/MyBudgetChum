
window.onload = async () =>
{
    try
    {
        const food = await Category.new('food')
        const coop = await Place.new('coop')
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

    const from = new Date(2021, 5, 3)
    const to = new Date(Date.now())
    console.log(await create_report(from, to, ReportType.CATEGORY))
    console.log(await create_report(from, to, ReportType.PLACE))
}
