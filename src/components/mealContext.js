import { createIcon } from '/src/utils/icons.js'
import { UtensilsCrossed } from 'lucide'

export function mealContext(mealName) {
  const el = document.createElement('div')
  el.className = 'meal-context'
  const icon = createIcon(UtensilsCrossed, 13, 2)
  el.appendChild(icon)
  const span = document.createElement('span')
  span.textContent = mealName ? `Aggiungendo a: ${mealName}` : ''
  el.appendChild(span)
  return el
}