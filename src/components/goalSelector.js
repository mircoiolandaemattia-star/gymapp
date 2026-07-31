import { createIcon } from '/src/utils/icons.js'
import { Flame } from 'lucide'
import { goalOptions } from '/src/mock/profileData.js'

function goalSelector({ active, calories, onChange }) {
  const card = document.createElement('div')
  card.className = 'card'

  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Obiettivo'
  card.appendChild(title)

  const desc = document.createElement('p')
  desc.className = 'card-subtitle'
  desc.textContent = 'Cosa vuoi raggiungere?'
  card.appendChild(desc)

  const chips = document.createElement('div')
  chips.className = 'chip-row'
  chips.style.cssText = 'margin-top:var(--space-md)'
  goalOptions.forEach((o) => {
    const chip = document.createElement('button')
    chip.className = 'gen-chip' + (active === o.value ? ' selected' : '')
    chip.textContent = o.label
    chip.addEventListener('click', () => onChange(o.value))
    chips.appendChild(chip)
  })
  card.appendChild(chips)

  const cal = document.createElement('div')
  cal.className = 'goal-calories'
  cal.appendChild(createIcon(Flame, 20, 2))
  const txt = document.createElement('span')
  txt.className = 'goal-calories-text'
  txt.textContent = 'Fabbisogno stimato'
  cal.appendChild(txt)
  const val = document.createElement('span')
  val.className = 'goal-calories-value'
  val.innerHTML = `${calories}<small> kcal/giorno</small>`
  cal.appendChild(val)
  card.appendChild(cal)

  return card
}

export { goalSelector }
