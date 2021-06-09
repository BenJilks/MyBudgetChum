import { Transaction, Group } from './transaction'

export enum ReportType
{
    CATEGORY,
    PLACE,
}

export async function create_report(from: Date, to: Date, type: ReportType): Promise<Map<Group, number>>
{
    const string_report = new Map()
    const categories: Group[] = []
    
    const transactions = await Transaction.get_in_range(from, to)
    transactions.forEach(transaction =>
    {
        const category: Group = 
            type == ReportType.CATEGORY 
            ? transaction.category
            : transaction.place
        
        const current_value = string_report.get(category.name) ?? 0
        string_report.set(category.name, current_value + transaction.amount)
        categories.push(category)
    })
    
    const report = new Map()
    string_report.forEach((value, key) => 
    {
        const category = categories.find(x => x.name == key)
        report.set(category, value)
    })
    return report
}
