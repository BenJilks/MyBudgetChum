
var category_list, category_input

function template(title: string, content: string)
{
    const element = document.createElement('div')
    element.innerHTML = `
        <h1>${ title }</h1>
        <p>${ content }</p>
    `

    return element
}

async function add()
{
    const name = category_input.value
    await Category.new(name)
    category_list.appendChild(template(name, name))
}

window.onload = async () =>
{
    category_list = document.getElementById('category-list')
    category_input = document.getElementById('category-input');

    const categories = await Category.get_all()
    categories.forEach(item =>
    {
        category_list.appendChild(template(item.name, item.name))
    })

    try
    {
        const food = await Category.new('food')
        const coop = await Place.new('coop')
        const transaction = await Transaction.new(2.50, food, coop)
    }
    catch
    {
        console.log('Already added test transaction')
    }
}
