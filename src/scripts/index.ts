
window.onload = () =>
{
    ['test', 'other test'].forEach(async item =>
    {
        try
        {
            const category = await Category.new(item)
            console.log(category)
        }
        catch (e)
        {
            console.log(e)
        }
    })
}
