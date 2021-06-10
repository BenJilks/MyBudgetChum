
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
