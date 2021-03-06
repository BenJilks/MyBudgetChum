import { format_money_of_currency } from '../scripts/lib/config'

test('format money', () =>
{
    expect(format_money_of_currency(21, 'GBP')).toBe('£21.00')
    expect(format_money_of_currency(-21, 'GBP')).toBe('-£21.00')
    expect(format_money_of_currency(5.3456, 'GBP')).toBe('£5.35')
    expect(format_money_of_currency(5.3, 'GBP')).toBe('£5.30')

    expect(format_money_of_currency(21, 'USD')).toBe('21.00 $')
    expect(format_money_of_currency(-21, 'USD')).toBe('-21.00 $')
    expect(format_money_of_currency(5.3456, 'USD')).toBe('5.35 $')

    expect(format_money_of_currency(1, 'SOL')).toBe('1.00 sol')
    expect(format_money_of_currency(-1, 'SOL')).toBe('-1.00 sol')
    expect(format_money_of_currency(21, 'SOL')).toBe('21.00 soles')
    expect(format_money_of_currency(-21, 'SOL')).toBe('-21.00 soles')
    expect(format_money_of_currency(5.3456, 'SOL')).toBe('5.35 soles')
})
