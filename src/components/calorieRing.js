function calorieRing(calories) {
  const card = document.createElement('div')
  card.className = 'card'

  const header = document.createElement('div')
  header.className = 'section-header'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Calorie giornaliere'
  header.appendChild(title)
  const link = document.createElement('a')
  link.href = '#'
  link.className = 'section-link'
  link.textContent = 'Vedi tutto'
  link.addEventListener('click', (e) => { e.preventDefault() })
  header.appendChild(link)
  card.appendChild(header)

  const ringWrap = document.createElement('div')
  ringWrap.className = 'calorie-ring-wrapper'

  const size = 140
  const stroke = 10
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const pct = Math.min(calories.consumed / calories.target, 1)
  const offset = circ * (1 - pct)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`)

  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  bgCircle.setAttribute('cx', String(size / 2))
  bgCircle.setAttribute('cy', String(size / 2))
  bgCircle.setAttribute('r', String(radius))
  bgCircle.setAttribute('fill', 'none')
  bgCircle.setAttribute('stroke', '#334155')
  bgCircle.setAttribute('stroke-width', String(stroke))
  svg.appendChild(bgCircle)

  const progCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  progCircle.setAttribute('cx', String(size / 2))
  progCircle.setAttribute('cy', String(size / 2))
  progCircle.setAttribute('r', String(radius))
  progCircle.setAttribute('fill', 'none')
  progCircle.setAttribute('stroke', '#34D399')
  progCircle.setAttribute('stroke-width', String(stroke))
  progCircle.setAttribute('stroke-linecap', 'round')
  progCircle.setAttribute('stroke-dasharray', String(circ))
  progCircle.setAttribute('stroke-dashoffset', String(offset))
  progCircle.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`)
  svg.appendChild(progCircle)

  ringWrap.appendChild(svg)

  const center = document.createElement('div')
  center.className = 'calorie-ring-center'
  const big = document.createElement('span')
  big.className = 'calorie-ring-value'
  big.textContent = String(calories.consumed)
  center.appendChild(big)
  const small = document.createElement('span')
  small.className = 'calorie-ring-target'
  small.textContent = `/ ${calories.target} kcal`
  center.appendChild(small)
  ringWrap.appendChild(center)

  card.appendChild(ringWrap)

  const divider = document.createElement('div')
  divider.className = 'calorie-divider'
  card.appendChild(divider)

  const legend = document.createElement('div')
  legend.className = 'calorie-legend'

  const consumed = document.createElement('div')
  consumed.className = 'calorie-legend-item'
  const dot1 = document.createElement('span')
  dot1.className = 'calorie-dot'
  dot1.style.background = '#34D399'
  consumed.appendChild(dot1)
  const cText = document.createElement('span')
  cText.className = 'calorie-legend-label'
  cText.textContent = 'Consumate'
  consumed.appendChild(cText)
  const cVal = document.createElement('span')
  cVal.className = 'calorie-legend-value'
  cVal.textContent = `${calories.consumed} kcal`
  consumed.appendChild(cVal)
  legend.appendChild(consumed)

  const remaining = document.createElement('div')
  remaining.className = 'calorie-legend-item'
  const dot2 = document.createElement('span')
  dot2.className = 'calorie-dot'
  dot2.style.background = '#475569'
  remaining.appendChild(dot2)
  const rText = document.createElement('span')
  rText.className = 'calorie-legend-label'
  rText.textContent = 'Rimanenti'
  remaining.appendChild(rText)
  const rVal = document.createElement('span')
  rVal.className = 'calorie-legend-value'
  rVal.textContent = `${Math.max(calories.target - calories.consumed, 0)} kcal`
  remaining.appendChild(rVal)
  legend.appendChild(remaining)

  card.appendChild(legend)

  return card
}

export { calorieRing }
