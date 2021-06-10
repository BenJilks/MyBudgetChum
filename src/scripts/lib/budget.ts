import { Transaction } from './transaction'

export async function calculate_budget_left(date: Date): Promise<number>
{
    //const transactions = await Transaction.get_all()

    //temp weekly budget value
    let weekly_budget: number = 30;

    const start = new Date(date.valueOf())
    start.setDate(date.getDate() - date.getDay())

    const end = new Date(date.valueOf())
    end.setDate(start.getDate() + 7)

    const transactions = await Transaction.get_in_range(start, end)
    //console.log(transactions)

    let total_spent: number = 0;

    transactions.forEach(element => {
        //console.log(element)
        total_spent += element.amount;
    });

    console.log("Weekly spent: " + total_spent)
    
    let budget_left: number = weekly_budget - total_spent
    console.log("Budget remaining: " + budget_left)


    return budget_left
}
