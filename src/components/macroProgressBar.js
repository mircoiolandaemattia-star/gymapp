import { createIcon } from '/src/utils/icons.js'

function macroProgressBar({ label, value, target, color, icon, suffix = 'g' }) {
  const wrap = document.createElement('div')
  wrap.className = 'macro-bar'

  const row = document.createElement('div')
  row.className = 'macro-bar-row'

  const left = document.createElement('div')
  left.className = 'macro-bar-left'
  if (icon) {
    const ic = createIcon(icon, 16, 2)
    ic.style.color = color
    left.appendChild(ic)
  }
  const lbl = document.createElement('span')
  lbl.className = 'macro-bar-label'
  lbl.textContent = label
  left.appendChild(lbl)
  row.appendChild(left)

  const val = document.createElement('span')
  val.className = 'macro-bar-value'
  val.textContent = `${value}${suffix} / ${target}${suffix}`
  row.appendChild(val)

  wrap.appendChild(row)

  const track = document.createElement('div')
  track.className = 'macro-bar-track'
  const fill = document.createElement('div')
  fill.className = 'macro-bar-fill'
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  fill.style.width = `${pct}%`
  fill.style.background = color
  track.appendChild(fill)
  wrap.appendChild(track)

  return wrap
}

export { macroProgressBar }
