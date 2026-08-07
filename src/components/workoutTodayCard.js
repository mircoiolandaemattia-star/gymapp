import { createIcon } from '/src/utils/icons.js'
import { Play, Clock } from 'lucide'
import { navigate } from '/src/utils/router.js'

function workoutTodayCard(workout) {
  const card = document.createElement('div')
  card.className = 'card'

  const header = document.createElement('div')
  header.className = 'section-header'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Allenamento di oggi'
  header.appendChild(title)
  const link = document.createElement('a')
  link.href = '#'
  link.className = 'section-link'
  link.textContent = 'Vedi tutto'
  link.addEventListener('click', (e) => { e.preventDefault(); navigate('/scheda') })
  header.appendChild(link)
  card.appendChild(header)

  const badgeRow = document.createElement('div')
  badgeRow.className = 'workout-badge-row'

  const badge = document.createElement('span')
  badge.className = 'workout-badge'
  badge.textContent = workout.type
  badgeRow.appendChild(badge)

  if (!workout.isRest) {
    const duration = document.createElement('span')
    duration.className = 'workout-duration'
    const clockIcon = createIcon(Clock, 14, 2)
    clockIcon.style.cssText = 'flex-shrink:0'
    duration.appendChild(clockIcon)
    const durText = document.createElement('span')
    durText.textContent = `${workout.duration} min`
    duration.appendChild(durText)
    badgeRow.appendChild(duration)
  }

  card.appendChild(badgeRow)

  const wName = document.createElement('h2')
  wName.className = 'workout-name'
  wName.textContent = workout.name
  card.appendChild(wName)

  if (!workout.isRest) {
    const wCount = document.createElement('p')
    wCount.className = 'workout-exercises'
    wCount.textContent = `${workout.exercisesCount} esercizi`
    card.appendChild(wCount)

    const btn = document.createElement('button')
    btn.className = 'btn btn-primary btn-full workout-start-btn'
    btn.appendChild(createIcon(Play, 18, 2))
    const btnText = document.createElement('span')
    btnText.textContent = 'Inizia allenamento'
    btn.appendChild(btnText)
    if (workout.onStart) btn.addEventListener('click', workout.onStart)
    card.appendChild(btn)
  }

  return card
}

export { workoutTodayCard }
