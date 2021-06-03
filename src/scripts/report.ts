
type Report = {[category: string]: number}

enum ReportType
{
    CATEGORY,
    PLACE,
}

async function create_report(from: Date, to: Date, type: ReportType): Promise<Report>
{
    let report: Report = {}

    const transactions = await Transaction.get_in_range(from, to)
    transactions.forEach(transaction =>
    {
        const category = type == ReportType.CATEGORY 
            ? transaction.category.name
            : transaction.place.name

        if (!(category in report))
            report[category] = 0
        report[category] += transaction.amount
    })

    return report
}
