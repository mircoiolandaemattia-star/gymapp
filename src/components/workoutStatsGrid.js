import { createIcon } from '/src/utils/icons.js'
import { Flame, Dumbbell, Clock } from 'lucide'

function workoutStatsGrid({ streak, sessions, hours }) {
  const card = document.createElement('div')
  card.className = 'card'

  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Statistiche allenamento'
  card.appendChild(title)

  const grid = document.createElement('div')
  grid.className = 'quick-stats-grid'

  const items = [
    { icon: Flame, value: String(streak), label: 'Giorni di fila', color: 'var(--warning)' },
    { icon: Dumbbell, value: String(sessions), label: 'Sessioni', color: 'var(--accent)' },
    { icon: Clock, value: `${hours}h`, label: 'Ore totali', color: 'var(--info)' },
  ]

  items.forEach((it) => {
    const stat = document.createElement('div')
    stat.className = 'quick-stat-card'
    const iconWrap = document.createElement('div')
    iconWrap.className = 'quick-stat-icon'
    const svg = createIcon(it.icon, 20, 2)
    svg.style.color = it.color
    iconWrap.appendChild(svg)
    stat.appendChild(iconWrap)
    const value = document.createElement('span')
    value.className = 'quick-stat-value'
    value.style.color = it.color
    value.textContent = it.value
    stat.appendChild(value)
    const label = document.createElement('span')
    label.className = 'quick-stat-label'
    label.textContent = it.label
    stat.appendChild(label)
    grid.appendChild(stat)
  })

  card.appendChild(grid)
  return card
}

export { workoutStatsGrid }
