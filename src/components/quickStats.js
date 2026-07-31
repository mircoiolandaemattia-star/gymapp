import { createIcon } from '/src/utils/icons.js'
import { Flame, Clock, Dumbbell } from 'lucide'

function quickStats(stats) {
  const grid = document.createElement('div')
  grid.className = 'quick-stats-grid'

  const items = [
    { label: 'Streak', value: `${stats.streak}`, unit: 'giorni', icon: Flame, color: 'var(--warning)' },
    { label: 'Ore/sett', value: `${stats.hoursThisWeek}`, unit: 'h', icon: Clock, color: 'var(--accent)' },
    { label: 'Sessioni', value: `${stats.totalSessions}`, unit: 'tot', icon: Dumbbell, color: 'var(--info)' },
  ]

  items.forEach((item) => {
    const card = document.createElement('div')
    card.className = 'quick-stat-card'

    const iconWrap = document.createElement('div')
    iconWrap.className = 'quick-stat-icon'
    iconWrap.style.color = item.color
    iconWrap.appendChild(createIcon(item.icon, 20, 2))
    card.appendChild(iconWrap)

    const value = document.createElement('span')
    value.className = 'quick-stat-value'
    value.style.color = item.color
    value.textContent = item.value
    card.appendChild(value)

    const label = document.createElement('span')
    label.className = 'quick-stat-label'
    label.textContent = item.label
    card.appendChild(label)

    grid.appendChild(card)
  })

  return grid
}

export { quickStats }
