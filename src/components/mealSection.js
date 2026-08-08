import { createIcon } from '/src/utils/icons.js'
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, UtensilsCrossed } from 'lucide'

function foodQtyLabel(food) {
  if (food.qtyLabel) return food.qtyLabel
  return `${food.qty}g`
}

function mealSection(meal, { expanded, onToggle, onAdd, onEdit, onDelete }) {
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

  if (!meal.foods.length) {
    const empty = document.createElement('div')
    empty.className = 'meal-empty'
    empty.appendChild(createIcon(UtensilsCrossed, 22, 1.5))
    const t = document.createElement('p')
    t.textContent = 'Nessun alimento aggiunto. Tocca + per iniziare'
    empty.appendChild(t)
    body.appendChild(empty)
  } else if (expanded) {
    meal.foods.forEach((f) => {
      const row = document.createElement('div')
      row.className = 'food-row'

      const main = document.createElement('div')
      main.className = 'food-row-main'
      const fName = document.createElement('span')
      fName.className = 'food-name'
      fName.textContent = f.name
      main.appendChild(fName)
      const fQty = document.createElement('span')
      fQty.className = 'food-qty'
      fQty.textContent = foodQtyLabel(f)
      main.appendChild(fQty)
      row.appendChild(main)

      const fCal = document.createElement('span')
      fCal.className = 'food-cal'
      fCal.textContent = `${f.cal} kcal`
      row.appendChild(fCal)

      const actions = document.createElement('div')
      actions.className = 'food-actions'
      const editBtn = document.createElement('button')
      editBtn.className = 'food-action-btn'
      editBtn.setAttribute('aria-label', `Modifica quantità di ${f.name}`)
      editBtn.appendChild(createIcon(Pencil, 14, 2))
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (onEdit) onEdit(f)
      })
      actions.appendChild(editBtn)
      const delBtn = document.createElement('button')
      delBtn.className = 'food-action-btn food-action-danger'
      delBtn.setAttribute('aria-label', `Elimina ${f.name}`)
      delBtn.appendChild(createIcon(Trash2, 14, 2))
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (onDelete) onDelete(f)
      })
      actions.appendChild(delBtn)
      row.appendChild(actions)

      body.appendChild(row)
    })
  }
  sec.appendChild(body)

  return sec
}

export { mealSection }