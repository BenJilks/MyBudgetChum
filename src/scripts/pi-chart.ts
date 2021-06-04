
class PiChart
{

    private static readonly COLORS = ['lightgreen', 'lightblue', 'white']

    private container: HTMLDivElement
    private description: HTMLParagraphElement
    private ring_container: HTMLDivElement

    public constructor(container: HTMLDivElement)
    {
        this.container = container
        this.description = container.querySelector('#description')
        this.ring_container = container.querySelector('#ring-container')
    }

    public set_data(data: Map<string, number>)
    {
        // Calculate total
        let total = 0
        data.forEach(num => total += num)

        let last_rotation_offset = 0
        let index = 0
        data.forEach((num, category) =>
        {
            const percent = num / total
            const ring = document.createElement('div')
            const rotation = `rotateZ(${ last_rotation_offset * 360 }deg)`
            const color = PiChart.COLORS[index]
            ring.className = 'ring'
            ring.style.clipPath = this.clip_path_for(percent)
            ring.style.transform = rotation
            ring.style.borderColor = color

            ring.onmouseenter = () =>
            {
                ring.style.transform = rotation + ' scale(1.1)'
                this.description.innerHTML = category
                this.description.style.color = color
                this.description.style.opacity = '1'
            }
            ring.onmouseleave = () =>
            {
                ring.style.transform = rotation
                this.description.innerHTML = ''
                this.description.style.opacity = '0'
            }

            this.ring_container.appendChild(ring)
            last_rotation_offset += percent
            index += 1
        })
    }

    private clip_path_for(percent: number): string
    {
        const x = (Math.cos(percent * 2 * Math.PI - Math.PI / 2) * 200 + 50)
        const y = (Math.sin(percent * 2 * Math.PI - Math.PI / 2) * 200 + 50)

        if (percent < 0.25)
            return `polygon(50% 50%, 50% -100%, ${x}% ${y}%)`
        else if (percent < 0.5)
            return `polygon(50% 50%, 50% -100%, 200% -100%, ${x}% ${y}%)`
        else if (percent < 0.75)
            return `polygon(50% 50%, 50% -100%, 200% -100%, 200% 200%, ${x}% ${y}%)`
        else
            return `polygon(50% 50%, 50% -100%, 200% -100%, 200% 200%, -100% 200%, ${x}% ${y}%)`
    }

}
