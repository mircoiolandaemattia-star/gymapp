import { activityOptions } from '/src/mock/profileData.js'

function activityLevelSelector({ active, onChange }) {
  const card = document.createElement('div')
  card.className = 'card'

  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Livello di attività'
  card.appendChild(title)

  const desc = document.createElement('p')
  desc.className = 'card-subtitle'
  desc.textContent = 'Usato per calcolare il tuo fabbisogno'
  card.appendChild(desc)

  const chips = document.createElement('div')
  chips.className = 'chip-row'
  chips.style.cssText = 'margin-top:var(--space-md)'
  activityOptions.forEach((o) => {
    const chip = document.createElement('button')
    chip.className = 'gen-chip' + (active === o.value ? ' selected' : '')
    chip.textContent = o.label
    chip.addEventListener('click', () => onChange(o.value))
    chips.appendChild(chip)
  })
  card.appendChild(chips)

  return card
}

export { activityLevelSelector }
