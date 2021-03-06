import { DataBase } from './database'
import { Category, Place, Transaction } from './transaction'

export enum RepeatType
{
    DAILY = 0,
    WEEKLY,
    MONTHLY,
    YEARLY,
}

export class RepeatTimer
{

    public readonly type: RepeatType
    public readonly month: number
    public readonly month_day: number
    public readonly week_day: number
    public readonly hour: number
    private next: number

    public constructor(data: Partial<RepeatTimer>, next?: Date)
    {
        this.month = 0
        this.month_day = 0
        this.week_day = 0
        this.hour = 0
        this.next = next?.valueOf() ?? Date.now()
        Object.assign(this, data)
        this.trigger()
    }

    private daily()
    {
        let next = new Date(this.next)
        next.setDate(next.getDate() + 1)
        next.setHours(this.hour)
        this.next = next.valueOf()
    }

    private weekly()
    {
        let next = new Date(this.next)
        next.setDate(next.getDate() + 7)
        next.setDate(next.getDate() - next.getDay() + this.week_day)
        next.setHours(this.hour)
        this.next = next.valueOf()
    }

    private monthly()
    {
        let next = new Date(this.next)
        next.setMonth(next.getMonth() + 1)
        next.setDate(this.month_day)
        next.setHours(this.hour)
        this.next = next.valueOf()
    }
 
    private yearly()
    {
        const last = new Date(this.next)
        let next = new Date(
            last.getFullYear() + 1,
            this.month,
            this.month_day,
            this.hour)

        this.next = next.valueOf()
    }

    public has_been_met(): boolean
    {
        return Date.now() >= this.next
    }

    public get_next_date(): Date
    {
        return new Date(this.next)
    }

    public trigger()
    {
        switch (this.type)
        {
            case RepeatType.DAILY:
                this.daily()
                break

            case RepeatType.WEEKLY:
                this.weekly()
                break

            case RepeatType.MONTHLY:
                this.monthly()
                break

            case RepeatType.YEARLY:
                this.yearly()
                break
        }
    }

}

export class Repeat
{

    public readonly id: number
    public readonly name: string
    public readonly amount: number
    public readonly category: Category
    public readonly place: Place
    public readonly timer: RepeatTimer

    private constructor(data: Partial<Repeat>)
    {
        Object.assign(this, data)
    }

    public static async new(name: string, amount: number, category: Category, place: Place, timer: RepeatTimer): Promise<Repeat>
    {
        let partial = { 
            'name': name, 'amount': amount, 'category': category, 
            'place': place, 'timer': timer 
        }

        partial['id'] = await DataBase.the().insert('repeat', partial)
        return new Repeat(partial)
    }

    public static async update(id: number, name: string, amount: number, category: Category, place: Place, timer: RepeatTimer): Promise<void>
    {
        let partial = { 
            'id': id, 'name': name, 'amount': amount, 'category': category, 
            'place': place, 'timer': timer 
        }

        await DataBase.the().update('repeat', partial, id)
    }

    public static async get_all(): Promise<Repeat[]>
    {
        const repeats = await DataBase.the().get('repeat')
        const keys = await DataBase.the().getKeys('repeat')
        return repeats.map((repeat: any, i) => 
        {
            repeat.id = keys[i]
            repeat.timer = new RepeatTimer(repeat.timer)
            return new Repeat(repeat)
        })
    }

    public static async get(id: number): Promise<Repeat>
    {
        return (await DataBase.the().get('repeat', id))[0]
    }

    public async trigger_if_timer_condition_is_met(): Promise<boolean>
    {
        let did_trigger = false
        while (this.timer.has_been_met())
        {
            await Transaction.new(this.amount, this.category, this.place, this.timer.get_next_date())
            this.timer.trigger()
            did_trigger = true
        }

        if (did_trigger)
            await DataBase.the().update('repeat', this, this.id)

        return did_trigger
    }

}
