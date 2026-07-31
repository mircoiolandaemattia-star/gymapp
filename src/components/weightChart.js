const SVGNS = 'http://www.w3.org/2000/svg'
let uid = 0

function el(tag, attrs, parent) {
  const node = document.createElementNS(SVGNS, tag)
  for (const [k, v] of Object.entries(attrs || {})) {
    node.setAttribute(k, v)
  }
  if (parent) parent.appendChild(node)
  return node
}

function weightChart({ data }) {
  const W = 320
  const H = 132
  const PAD_X = 10
  const PAD_TOP = 12
  const PAD_BOTTOM = 20
  const innerW = W - PAD_X * 2
  const innerH = H - PAD_TOP - PAD_BOTTOM

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = range * 0.2
  const lo = min - pad
  const hi = max + pad

  const n = data.length
  const x = (i) => (n === 1 ? PAD_X + innerW / 2 : PAD_X + (i / (n - 1)) * innerW)
  const y = (v) => PAD_TOP + innerH - ((v - lo) / (hi - lo)) * innerH

  const id = `wg-${++uid}`
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'weight-chart' })

  const defs = el('defs', {}, svg)
  const grad = el('linearGradient', { id, x1: '0', y1: '0', x2: '0', y2: '1' }, defs)
  el('stop', { offset: '0%', 'stop-color': '#34D399', 'stop-opacity': '0.25' }, grad)
  el('stop', { offset: '100%', 'stop-color': '#34D399', 'stop-opacity': '0' }, grad)

  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)

  el('path', { d: `M${pts.join(' L')} L${x(n - 1).toFixed(1)},${H - PAD_BOTTOM} L${x(0).toFixed(1)},${H - PAD_BOTTOM} Z`, fill: `url(#${id})` }, svg)

  const line = el('path', { d: `M${pts.join(' L')}`, fill: 'none' }, svg)
  line.style.stroke = 'var(--accent)'
  line.style.strokeWidth = '2'
  line.style.strokeLinejoin = 'round'
  line.style.strokeLinecap = 'round'

  const labelStep = Math.max(1, Math.ceil(n / 6))
  data.forEach((d, i) => {
    const cx = x(i).toFixed(1)
    const cy = y(d.value).toFixed(1)
    const dot = el('circle', { cx, cy, r: '3', fill: '#0f172a' }, svg)
    dot.style.stroke = 'var(--accent)'
    dot.style.strokeWidth = '2'
    if (i % labelStep === 0 || i === n - 1) {
      const t = el('text', { x: cx, y: H - 6, 'text-anchor': 'middle', class: 'weight-chart-label' }, svg)
      t.textContent = d.label
    }
  })

  return svg
}

export { weightChart }
