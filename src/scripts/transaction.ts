
abstract class Group
{

    public readonly name: string
    public readonly color: number

    protected constructor(name: string, color: number)
    {
        this.name = name
        this.color = color
    }

}

class Category extends Group
{

    public static async new(name: string, color: number): Promise<Category>
    {
        const category = new Category(name, color)
        await DataBase.the().insert('categories', category)
        return category
    }

    public static get_all(): Promise<Category[]>
    {
        return DataBase.the().get('categories')
    }

}

class Place extends Group
{

    public static async new(name: string, color: number): Promise<Place>
    {
        const category = new Place(name, color)
        await DataBase.the().insert('places', category)
        return category
    }

    public static get_all(): Promise<Place[]>
    {
        return DataBase.the().get('places')
    }

}

class Transaction
{

    public readonly timestamp: Date
    public readonly amount: number
    public readonly category: Category
    public readonly place: Place

    private constructor(amount: number, category: Category, place: Place, timestamp?: Date)
    {
        this.timestamp = timestamp ?? new Date(Date.now())
        this.amount = amount
        this.category = category
        this.place = place
    }

    public static async new(amount: number, category: Category, place: Place, timestamp?: Date): Promise<Transaction>
    {
        const transaction = new Transaction(amount, category, place, timestamp)
        await DataBase.the().insert('transactions', transaction)
        return transaction
    }

    public static get_all(): Promise<Transaction[]>
    {
        return DataBase.the().get('transactions')
    }

    public static get_in_range(from: Date, to: Date): Promise<Transaction[]>
    {
        return DataBase.the().get('transactions', IDBKeyRange.bound(from, to))
    }

}
