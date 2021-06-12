import { DataBase } from './database'

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December',
]

export const WEEK_DAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday',
]

export class Config
{

    private static instance: Config = null

    private settings: Map<string, string>
    private has_loaded: boolean
    private notify_on_load: (() => void)[]

    private constructor()
    {
        this.settings = new Map()
        this.has_loaded = false
        this.notify_on_load = []
        this.load()
    }

    private async load()
    {
        const config = await DataBase.the().get('config')
        config.forEach(item => this.settings.set(item.key, item.value))
        this.has_loaded = true
        this.notify_on_load.forEach(resolve => resolve())
    }

    private wait_for_load(): Promise<void>
    {
        return new Promise(resolve =>
        {
            if (!this.has_loaded)
                this.notify_on_load.push(() => resolve(null))
            else
                resolve(null)
        })
    }

    public async get(key: string): Promise<string>
    {
        await this.wait_for_load()
        return this.settings.get(key)
    }

    public async set(key: string, value: string): Promise<void>
    {
        await this.wait_for_load()
        const is_new_value = !this.settings.has(key)
        this.settings.set(key, value)
        
        const setting = { key: key, value: value }
        if (is_new_value)
            await DataBase.the().insert('config', setting)
        else
            await DataBase.the().update('config', setting)
    }

    public static the(): Config
    {
        if (Config.instance == null)
            Config.instance = new Config()

        return Config.instance
    }

}

enum CurrencyFormatType
{
    Prefix,
    Suffix,
    Plural,
}

interface Currency
{
    readonly full_name: string
    readonly symbol: string
    readonly format_type: CurrencyFormatType
    readonly plural: string
    readonly precision: number
}

function make_currency(full_name: string, symbol: string, 
    format_type: CurrencyFormatType, plural?: string, precision?: number): Currency
{
    return {
        full_name: full_name, 
        symbol: symbol,
        format_type: format_type,
        plural: plural,
        precision: precision ?? 2,
    }
}

export const CURRENCIES: Map<string, Currency> = new Map(
[
    ['GBP', make_currency('Pound Sterling', '£', CurrencyFormatType.Prefix)],
    ['USD', make_currency('United States Dollar', '$', CurrencyFormatType.Suffix)],
    ['EUR', make_currency('Euro', '€', CurrencyFormatType.Suffix)],
    ['SOL', make_currency('Peruvian Sol', 'sol', CurrencyFormatType.Plural, 'soles')],
    ['BTC', make_currency('Bitcoin', '₿', CurrencyFormatType.Prefix, null, 8)],
    ['mBTC', make_currency('Millibitcoin', 'm₿', CurrencyFormatType.Prefix, null, 8 - 3)],
])

export function format_money_of_currency(value: number, currency_setting: string): string
{
    const currency = CURRENCIES.get(currency_setting)
    const precision = Math.pow(10, currency.precision)
    const display_value = Math.round(value * precision) / precision

    switch (currency.format_type)
    {
        case CurrencyFormatType.Prefix:
            return `${ value < 0 ? '-' : '' }${ currency.symbol }${ Math.abs(display_value) }`

        case CurrencyFormatType.Suffix:
            return `${ display_value } ${ currency.symbol }`

        case CurrencyFormatType.Plural:
            return `${ display_value } ${ Math.abs(value) == 1 ? currency.symbol : currency.plural }`
    }
}

export async function format_money(value: number): Promise<string>
{
    let currency_setting = await Config.the().get('currency')
    return await format_money_of_currency(value, currency_setting ?? 'SOL')
}

export async function get_weekly_budget(): Promise<number>
{
    const budget = parseInt((await Config.the().get('budget')) ?? "0")
    const monthly = (await Config.the().get('budget-is-monthly')) ?? "false"

    return monthly == "true"
        ? budget / 4.5
        : budget
}

export async function get_monthly_budget(): Promise<number>
{
    const budget = parseInt((await Config.the().get('budget')) ?? "0")
    const monthly = (await Config.the().get('budget-is-monthly')) ?? "false"

    return monthly == "true"
        ? budget
        : budget * 4.5
}
