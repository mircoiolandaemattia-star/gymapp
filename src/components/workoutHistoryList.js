import { createIcon } from '/src/utils/icons.js'
import { Dumbbell, Timer, Flame } from 'lucide'

function workoutHistoryList(history) {
  const section = document.createElement('div')

  const header = document.createElement('div')
  header.className = 'section-header'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Storico allenamenti'
  header.appendChild(title)
  const link = document.createElement('a')
  link.href = '#'
  link.className = 'section-link'
  link.textContent = 'Vedi tutto'
  link.addEventListener('click', (e) => { e.preventDefault() })
  header.appendChild(link)
  section.appendChild(header)

  const list = document.createElement('div')
  list.className = 'history-list'

  history.forEach((h) => {
    const item = document.createElement('div')
    item.className = 'history-item'

    const iconBox = document.createElement('div')
    iconBox.className = 'history-icon'
    iconBox.style.color = h.typeColor
    iconBox.appendChild(createIcon(Dumbbell, 18, 2))
    item.appendChild(iconBox)

    const info = document.createElement('div')
    info.className = 'history-info'

    const nameRow = document.createElement('div')
    nameRow.className = 'history-name-row'
    const hName = document.createElement('span')
    hName.className = 'history-name'
    hName.textContent = h.name
    nameRow.appendChild(hName)
    const hBadge = document.createElement('span')
    hBadge.className = 'history-type-badge'
    hBadge.style.cssText = `background:rgba(52,211,153,0.15);color:var(--accent)`
    hBadge.textContent = h.type
    nameRow.appendChild(hBadge)
    info.appendChild(nameRow)

    const meta = document.createElement('div')
    meta.className = 'history-meta'
    const whenSpan = document.createElement('span')
    whenSpan.textContent = h.when
    meta.appendChild(whenSpan)
    const dot = document.createElement('span')
    dot.textContent = '·'
    meta.appendChild(dot)
    const timerIcon = createIcon(Timer, 12, 2)
    meta.appendChild(timerIcon)
    const durSpan = document.createElement('span')
    durSpan.textContent = h.duration
    meta.appendChild(durSpan)
    const dot2 = document.createElement('span')
    dot2.textContent = '·'
    meta.appendChild(dot2)
    const flameIcon = createIcon(Flame, 12, 2)
    flameIcon.style.color = 'var(--warning)'
    meta.appendChild(flameIcon)
    const calSpan = document.createElement('span')
    calSpan.textContent = `${h.calories} kcal`
    meta.appendChild(calSpan)
    info.appendChild(meta)

    item.appendChild(info)
    list.appendChild(item)
  })

  section.appendChild(list)
  return section
}

export { workoutHistoryList }
