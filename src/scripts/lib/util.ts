
export function $(query: string): any
{
    return document.querySelector(query)
}

export function color_from_number(num: number): string
{
    const r = num & 0xFF
    const g = (num >> 4) & 0xFF
    const b = (num >> 8) & 0xFF
    return `rgb(${ r }, ${ g }, ${ b })`
}

export function get_week(date: Date): Date
{
    const start = new Date(date.valueOf())
    start.setHours(0, 0, 0, 0)
    start.setDate(date.getDate() - date.getDay())
    return start
}

export function get_week_start_and_end(date: Date): [Date, Date]
{
    const start = get_week(date)
    const end = new Date(start.valueOf())
    end.setDate(end.getDate() + 7)
    return [start, end]
}
