
class Category
{
    name: string

    private constructor(name: string)
    {
        this.name = name
    }

    public static new(name: string): Category
    {
        const category = new Category(name)

        DataBase.the().insert('categories', { 'name': name })
        return category
    }
}

class Place
{
    name: string
}

class Transaction
{

    private id: number
    private amount: number
    private category: Category
    private place: Place

    private constructor(id: number, amount: number, category: Category, place: Place)
    {
        this.id = id
        this.amount = amount
        this.category = category
        this.place = place
    }

    public static new(amount: number, category: Category, place: Place): Transaction
    {
        return new Transaction(0, amount, category, place)
    }

}
