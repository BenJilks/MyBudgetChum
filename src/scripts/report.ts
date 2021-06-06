import { Transaction, Group } from './transaction'

enum ReportType
{
    CATEGORY,
    PLACE,
}

async function create_report(from: Date, to: Date, type: ReportType): Promise<Map<Group, number>>
{
    let report = new Map()

    const transactions = await Transaction.get_in_range(from, to)
    transactions.forEach(transaction =>
    {
        const category: Group = 
            type == ReportType.CATEGORY 
            ? transaction.category
            : transaction.place

        report.set(category, (report.get(category) ?? 0) + transaction.amount)
    })

    return report
}
