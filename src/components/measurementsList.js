import { createIcon } from '/src/utils/icons.js'
import { Plus, Ruler } from 'lucide'

function fmtDelta(d) {
  if (d === 0) return '0 cm'
  const sign = d > 0 ? '+' : '-'
  const abs = Math.abs(d)
  const num = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  return `${sign}${num} cm`
}

function measurementsList({ measurements, onAdd }) {
  const card = document.createElement('div')
  card.className = 'card'

  const header = document.createElement('div')
  header.className = 'section-header'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Misurazioni corporee'
  header.appendChild(title)
  const addBtn = document.createElement('button')
  addBtn.className = 'card-add-btn measure-add-btn'
  addBtn.setAttribute('aria-label', 'Aggiungi misurazione')
  addBtn.appendChild(createIcon(Plus, 16, 2))
  addBtn.addEventListener('click', onAdd)
  header.appendChild(addBtn)
  card.appendChild(header)

  if (!measurements.length) {
    const empty = document.createElement('button')
    empty.className = 'photo-empty'
    empty.appendChild(createIcon(Ruler, 36, 1.5))
    const text = document.createElement('span')
    text.textContent = 'Aggiungi la prima misurazione'
    empty.appendChild(text)
    empty.addEventListener('click', onAdd)
    card.appendChild(empty)
    return card
  }

  const latest = measurements[0]
  const prev = measurements[1] || latest

  const rows = [
    { name: 'Vita', key: 'vita' },
    { name: 'Fianchi', key: 'fianchi' },
    { name: 'Petto', key: 'petto' },
    { name: 'Braccia', key: 'braccia' },
  ]

  rows.forEach((r) => {
    const value = latest[r.key]
    if (value == null) return
    const delta = value - (prev[r.key] ?? value)

    const row = document.createElement('div')
    row.className = 'measure-row'

    const iconWrap = document.createElement('div')
    iconWrap.className = 'measure-icon'
    iconWrap.appendChild(createIcon(Ruler, 16, 2))
    row.appendChild(iconWrap)

    const name = document.createElement('span')
    name.className = 'measure-name'
    name.textContent = r.name
    row.appendChild(name)

    const valueSpan = document.createElement('span')
    valueSpan.className = 'measure-value'
    valueSpan.textContent = `${value} cm`
    row.appendChild(valueSpan)

    const deltaSpan = document.createElement('span')
    deltaSpan.className = 'measure-delta' + (delta > 0 ? ' bad' : delta < 0 ? ' good' : ' flat')
    deltaSpan.textContent = fmtDelta(delta)
    row.appendChild(deltaSpan)

    card.appendChild(row)
  })

  return card
}

export { measurementsList }
