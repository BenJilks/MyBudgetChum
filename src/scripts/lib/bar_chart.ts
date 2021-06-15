import { format_money } from './config'

type Item = {label: string, value: number}

export class BarChart
{

    private bar_container: HTMLDivElement

    public constructor(container: HTMLDivElement)
    {
        this.bar_container = container.querySelector('#bar-container')
    }

    public async set_data(data: Item[])
    {
        this.bar_container.innerHTML = ''
        
        // Find the maximum value to set scale
        const max = Math.max(...data.map(x => Math.abs(x.value)))

        // Create all bars
        const bar_promises: Promise<HTMLDivElement>[] = []
        data.forEach((item, index) =>
            bar_promises.push(this.add_bar(item, max)))

        // Wait for all of them to be created, then add them to the chart
        const bars = await Promise.all(bar_promises)
        bars.forEach(item => this.bar_container.appendChild(item))
    }

    private async add_bar(item: Item, max: number): Promise<HTMLDivElement>
    {
        const unit = document.createElement('div')
        unit.className = 'unit'

        // Calculate bar posision, size and colour
        const percent = item.value / max * 0.8
        const bar = document.createElement('div')
        bar.id = 'bar'
        bar.style.height = Math.abs(percent)*30 + '%'
        if (item.value >= 0)
        {
            bar.style.backgroundColor = 'lightgreen'
            bar.style.transform = `translateY(-100%)`
        }
        else
        {
            bar.style.backgroundColor = 'red'
        }

        // Create label
        const label = document.createElement('text')
        label.id = 'label'
        label.innerHTML = `${ await format_money(item.value) }`
        if (item.value >= 0)
            label.style.top = `-${ 0.6 * 2 }em`
        else
            label.style.bottom = `-${ 0.6 * 2 }em`

        // Create x-axis label
        const x_label = document.createElement('text')
        x_label.id = 'x-label'
        x_label.innerHTML = item.label

        // Add components to element
        bar.appendChild(label)
        unit.appendChild(bar)
        unit.appendChild(x_label)
        return unit
    }

}
