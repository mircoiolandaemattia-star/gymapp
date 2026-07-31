function calorieChart({ data, target }) {
  const wrap = document.createElement('div')
  wrap.className = 'cal-chart'

  const maxVal = Math.max(...data.map((d) => d.value), target)

  const bars = document.createElement('div')
  bars.className = 'cal-bars'

  const labelStep = Math.max(1, Math.ceil(data.length / 7))

  data.forEach((d, i) => {
    const col = document.createElement('div')
    col.className = 'cal-col'

    const track = document.createElement('div')
    track.className = 'cal-track'
    const fill = document.createElement('div')
    fill.className = 'cal-fill' + (d.value > target ? ' over' : ' under')
    const pct = Math.max(4, (d.value / maxVal) * 100)
    fill.style.height = `${pct}%`
    track.appendChild(fill)
    col.appendChild(track)

    if (i % labelStep === 0 || i === data.length - 1) {
      const label = document.createElement('span')
      label.className = 'cal-label'
      label.textContent = d.label
      col.appendChild(label)
    }

    bars.appendChild(col)
  })

  wrap.appendChild(bars)

  const legend = document.createElement('div')
  legend.className = 'cal-legend'
  const items = [
    { color: 'var(--accent)', text: 'Sotto soglia' },
    { color: 'var(--error)', text: 'Sopra soglia' },
  ]
  items.forEach((it) => {
    const item = document.createElement('div')
    item.className = 'cal-legend-item'
    const dot = document.createElement('span')
    dot.className = 'cal-legend-dot'
    dot.style.background = it.color
    item.appendChild(dot)
    const txt = document.createElement('span')
    txt.textContent = it.text
    item.appendChild(txt)
    legend.appendChild(item)
  })
  wrap.appendChild(legend)

  return wrap
}

export { calorieChart }
