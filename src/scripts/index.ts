
window.onload = () =>
{
    ['test', 'other test'].forEach(item =>
    {
        const category = Category.new(item)
        console.log(category)
    })
}
