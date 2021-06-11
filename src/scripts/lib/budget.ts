import { DataBase } from './database';
import { Transaction } from './transaction'

export async function calculate_weekly_net_budget(date: Date): Promise<number>
{
    //console.log("\n\n");

    //const transactions = await Transaction.get_all()

    //temp weekly budget value
    const weekly_budget: number = 30;

    const start = new Date(date.valueOf());
    start.setDate(date.getDate() - date.getDay());

    const end = new Date(date.valueOf());
    //end.setDate(start.getDate() + 7);    //actual code
    end.setDate(date.getDate()  + (6 - date.getDay()));
    //console.log("\nstart getdate: "+start.getDate());


    let transactions = null;
    transactions = await Transaction.get_in_range(start, end);
    //console.log(transactions)

    let total_spent: number = 0;

    //console.log(`Week beginning: ${start}`)

    transactions.forEach(element => {
        console.log(element)
        total_spent += element.amount;
    });

    //console.log("Weekly spent: " + total_spent);
    
    let budget_left: number = weekly_budget - total_spent;
    //console.log("Budget remaining: " + budget_left);

    //console.log(`Week ending: ${end}`)

    return budget_left;
}

export async function calculate_total_net_budget(): Promise<number>
{

    let net_budget_left: number = 0;

    //get first transaction
    const first_transaction = Transaction.get_first();

    //get date of first transaction
    const date = new Date((await first_transaction).timestamp);
    date.setHours(0, 0, 0, 0)

    let current_date = new Date(Date.now())
    let end_of_current_week = new Date(current_date.setDate(current_date.getDate() + (7 - date.getDay())));

    //while the week that we're looking at is before the current date
    while (date <= end_of_current_week)
    {
        //calculate budget remaining for the specified week and change net_budget_left accordingly
        net_budget_left = net_budget_left + await calculate_weekly_net_budget(date);
        console.log(net_budget_left);

        //increment date to the next week
        date.setDate(date.getDate() + 7);

    }

    return net_budget_left;
}
