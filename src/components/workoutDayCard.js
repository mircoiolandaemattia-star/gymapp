import { createIcon } from '/src/utils/icons.js'
import { ChevronDown, ChevronUp, Dumbbell, Clock, Play, Pencil, Trash2 } from 'lucide'
import { navigate } from '/src/utils/router.js'

function workoutDayCard(day, { onEdit, onDelete } = {}) {
  const card = document.createElement('div')
  card.className = 'card workout-day-card'
  let expanded = false

  const main = document.createElement('div')
  main.className = 'workout-day-main'

  const badgeRow = document.createElement('div')
  badgeRow.className = 'workout-badge-row-ex'

  const badge = document.createElement('span')
  badge.className = 'workout-badge-ex'
  badge.style.cssText = `background:rgba(52,211,153,0.15);color:var(--accent)`
  badge.textContent = day.type
  badgeRow.appendChild(badge)

  const dur = document.createElement('span')
  dur.className = 'workout-duration-ex'
  dur.appendChild(createIcon(Clock, 12, 2))
  const durText = document.createElement('span')
  durText.textContent = `${day.duration} min`
  dur.appendChild(durText)
  badgeRow.appendChild(dur)

  main.appendChild(badgeRow)

  const name = document.createElement('h3')
  name.className = 'workout-day-name'
  name.textContent = day.name
  main.appendChild(name)

  const chips = document.createElement('div')
  chips.className = 'workout-muscle-chips'
  day.muscles.forEach((m) => {
    const chip = document.createElement('span')
    chip.className = 'workout-muscle-chip'
    chip.textContent = m
    chips.appendChild(chip)
  })
  main.appendChild(chips)

  const startBtn = document.createElement('button')
  startBtn.className = 'btn btn-primary btn-full workout-day-start'
  startBtn.appendChild(createIcon(Play, 16, 2))
  const btnLabel = document.createElement('span')
  btnLabel.textContent = 'Inizia'
  startBtn.appendChild(btnLabel)
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    navigate(`/scheda/allenamento/${day.id}`)
  })
  main.appendChild(startBtn)

  if (onEdit || onDelete) {
    const actions = document.createElement('div')
    actions.className = 'workout-day-actions'
    if (onEdit) {
      const editBtn = document.createElement('button')
      editBtn.className = 'btn-icon-sm'
      editBtn.setAttribute('aria-label', 'Modifica allenamento')
      editBtn.appendChild(createIcon(Pencil, 16, 2))
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        onEdit()
      })
      actions.appendChild(editBtn)
    }
    if (onDelete) {
      const delBtn = document.createElement('button')
      delBtn.className = 'btn-icon-sm btn-icon-danger'
      delBtn.setAttribute('aria-label', 'Elimina allenamento')
      delBtn.appendChild(createIcon(Trash2, 16, 2))
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        onDelete()
      })
      actions.appendChild(delBtn)
    }
    main.appendChild(actions)
  }

  card.appendChild(main)

  const expandToggle = document.createElement('div')
  expandToggle.className = 'workout-expand-toggle'
  const expandText = document.createElement('span')
  expandText.textContent = `${day.exercises.length} esercizi`
  expandToggle.appendChild(expandText)
  const expandIcon = createIcon(ChevronDown, 18, 2)
  expandToggle.appendChild(expandIcon)
  expandToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    expanded = !expanded
    exList.style.display = expanded ? 'block' : 'none'
    expandToggle.innerHTML = ''
    const txt = document.createElement('span')
    txt.textContent = expanded ? 'Nascondi' : `${day.exercises.length} esercizi`
    expandToggle.appendChild(txt)
    expandToggle.appendChild(expanded ? createIcon(ChevronUp, 18, 2) : createIcon(ChevronDown, 18, 2))
  })
  main.appendChild(expandToggle)

  const exList = document.createElement('div')
  exList.className = 'workout-exercise-list'
  exList.style.display = 'none'

  day.exercises.forEach((ex, i) => {
    const row = document.createElement('div')
    row.className = 'workout-ex-row'
    const num = document.createElement('span')
    num.className = 'workout-ex-num'
    num.textContent = String(i + 1)
    row.appendChild(num)
    const info = document.createElement('div')
    info.className = 'workout-ex-info'
    const exName = document.createElement('span')
    exName.className = 'workout-ex-name'
    exName.textContent = ex.name
    info.appendChild(exName)
    const exDetail = document.createElement('span')
    exDetail.className = 'workout-ex-detail'
    exDetail.textContent = `${ex.sets}x${ex.reps} · ${ex.weight}kg`
    info.appendChild(exDetail)
    row.appendChild(info)
    row.appendChild(createIcon(Dumbbell, 16, 2))
    exList.appendChild(row)
  })

  card.appendChild(exList)

  return card
}

export { workoutDayCard }
