import { createIcon } from '/src/utils/icons.js'
import { Coffee, Cookie, Beef, Zap, UtensilsCrossed, Plus } from 'lucide'
import { navigate } from '/src/utils/router.js'

function mealIcon(name) {
  const map = {
    coffee: Coffee, cookie: Cookie, beef: Beef, zap: Zap,
  }
  return map[name] || UtensilsCrossed
}

function mealsSummaryCard(meals) {
  const card = document.createElement('div')
  card.className = 'card'

  const header = document.createElement('div')
  header.className = 'section-header'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Pasti di oggi'
  header.appendChild(title)
  const link = document.createElement('a')
  link.href = '#'
  link.className = 'section-link'
  link.textContent = 'Vedi tutto'
  link.addEventListener('click', (e) => { e.preventDefault(); navigate('/dieta') })
  header.appendChild(link)
  card.appendChild(header)

  if (!meals || meals.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'meals-empty'
    const emptyIcon = createIcon(UtensilsCrossed, 32, 1.5)
    emptyIcon.style.cssText = 'color:var(--text-muted)'
    empty.appendChild(emptyIcon)
    const emptyText = document.createElement('p')
    emptyText.className = 'meals-empty-text'
    emptyText.textContent = 'Nessun pasto registrato oggi'
    empty.appendChild(emptyText)
    const addBtn = document.createElement('button')
    addBtn.className = 'btn btn-primary'
    addBtn.appendChild(createIcon(Plus, 16, 2))
    const addLabel = document.createElement('span')
    addLabel.textContent = 'Aggiungi pasto'
    addBtn.appendChild(addLabel)
    addBtn.addEventListener('click', () => navigate('/dieta'))
    empty.appendChild(addBtn)
    card.appendChild(empty)
    return card
  }

  const list = document.createElement('div')
  list.className = 'meals-list'

  meals.forEach((m) => {
    const item = document.createElement('div')
    item.className = 'meal-item-row'

    const iconWrap = document.createElement('div')
    iconWrap.className = 'meal-item-icon'
    iconWrap.style.color = m.color
    iconWrap.appendChild(createIcon(mealIcon(m.icon), 18, 2))
    item.appendChild(iconWrap)

    const info = document.createElement('div')
    info.className = 'meal-item-info'
    const mName = document.createElement('span')
    mName.className = 'meal-item-name'
    mName.textContent = m.name
    info.appendChild(mName)
    const mDetail = document.createElement('span')
    mDetail.className = 'meal-item-detail'
    mDetail.textContent = `${m.calories} kcal · ${m.foods} alimenti`
    info.appendChild(mDetail)
    item.appendChild(info)

    const time = document.createElement('span')
    time.className = 'meal-item-time'
    time.textContent = m.time
    item.appendChild(time)

    list.appendChild(item)
  })

  card.appendChild(list)
  return card
}

export { mealsSummaryCard }
