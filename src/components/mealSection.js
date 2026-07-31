import { createIcon } from '/src/utils/icons.js'
import { Plus, ChevronDown, ChevronUp } from 'lucide'

function foodQtyLabel(food) {
  if (food.qtyLabel) return food.qtyLabel
  return `${food.qty}g`
}

function mealSection(meal, { expanded, onToggle, onAdd }) {
  const sec = document.createElement('div')
  sec.className = 'card meal-section' + (expanded ? ' expanded' : '')

  const totalCal = meal.foods.reduce((acc, f) => acc + f.cal, 0)

  const head = document.createElement('button')
  head.className = 'meal-section-head'
  head.setAttribute('aria-expanded', String(expanded))

  const dot = document.createElement('span')
  dot.className = 'meal-section-dot'
  dot.style.background = meal.color
  head.appendChild(dot)

  const info = document.createElement('div')
  info.className = 'meal-section-info'
  const name = document.createElement('span')
  name.className = 'meal-section-name'
  name.textContent = meal.name
  info.appendChild(name)
  const meta = document.createElement('span')
  meta.className = 'meal-section-meta'
  meta.textContent = `${meal.foods.length} alimenti · ${totalCal} kcal`
  info.appendChild(meta)
  head.appendChild(info)

  head.appendChild(createIcon(expanded ? ChevronUp : ChevronDown, 18, 2))
  head.addEventListener('click', onToggle)
  sec.appendChild(head)

  const addBtn = document.createElement('button')
  addBtn.className = 'meal-add-btn'
  addBtn.setAttribute('aria-label', `Aggiungi alimento a ${meal.name}`)
  addBtn.appendChild(createIcon(Plus, 16, 2))
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    onAdd()
  })
  sec.appendChild(addBtn)

  const body = document.createElement('div')
  body.className = 'meal-section-body'
  if (expanded) {
    meal.foods.forEach((f) => {
      const row = document.createElement('div')
      row.className = 'food-row'
      const fName = document.createElement('span')
      fName.className = 'food-name'
      fName.textContent = f.name
      row.appendChild(fName)
      const fQty = document.createElement('span')
      fQty.className = 'food-qty'
      fQty.textContent = foodQtyLabel(f)
      row.appendChild(fQty)
      const fCal = document.createElement('span')
      fCal.className = 'food-cal'
      fCal.textContent = `${f.cal} kcal`
      row.appendChild(fCal)
      body.appendChild(row)
    })
  }
  sec.appendChild(body)

  return sec
}

export { mealSection }
