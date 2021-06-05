
class BarChart
{

    private bar_container: HTMLDivElement

    public constructor(container: HTMLDivElement)
    {
        this.bar_container = container.querySelector('#bar-container')
    }

    public set_data(data: number[])
    {
        this.bar_container.innerHTML = ''
        data.forEach((item, index) =>
            this.add_bar(item, index + 1))
    }

    private add_bar(value: number, index: number)
    {
        const unit = document.createElement('div')
        unit.className = 'unit'

        const bar = document.createElement('div')
        bar.id = 'bar'
        bar.style.height = Math.abs(value) + 'em'
        bar.style.marginTop = `${ -Math.max(value, 0) }em`
        if (value >= 0)
            bar.style.backgroundColor = 'lightgreen'
        else
            bar.style.backgroundColor = 'red'
        
        const label = document.createElement('text')
        label.id = 'label'
        label.innerHTML = `£${ Math.round(value * 100) / 100 }`
        if (value >= 0)
            label.style.top = `-${ 0.6 * 2 }em`
        else
            label.style.bottom = `-${ 0.6 * 2 }em`

        const x_label = document.createElement('text')
        x_label.id = 'x-label'
        x_label.innerHTML = (index++) + ''
        
        bar.appendChild(label)
        unit.appendChild(bar)
        unit.appendChild(x_label)
        this.bar_container.appendChild(unit)
    }

}
