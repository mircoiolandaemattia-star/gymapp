import { meals } from '/src/mock/data.js'
import { createIcon } from '/src/utils/icons.js'
import { Flame, Droplet, Wheat, CircleDot } from 'lucide'

function render() {
  const section = document.createElement('section')
  section.className = 'page dieta-page'

  const header = document.createElement('div')
  header.className = 'page-header'
  header.innerHTML = `
    <h1 class="page-title">Dieta</h1>
    <p class="page-subtitle">Piano alimentare</p>
  `
  section.appendChild(header)

  const totalCal = meals.reduce((acc, m) => acc + m.cal, 0)
  const totalP = meals.reduce((acc, m) => acc + m.protein, 0)
  const totalC = meals.reduce((acc, m) => acc + m.carbs, 0)
  const totalF = meals.reduce((acc, m) => acc + m.fat, 0)

  const summary = document.createElement('div')
  summary.className = 'diet-summary-grid'

  const calor = document.createElement('div')
  calor.className = 'diet-summary-card'
  const calSvg = createIcon(Flame, 20, 2)
  calSvg.classList.add('color-accent')
  calor.appendChild(calSvg)
  calor.innerHTML += '<span class="stat-label">Calorie</span><span class="stat-value">' + totalCal + '</span>'
  summary.appendChild(calor)

  const prot = document.createElement('div')
  prot.className = 'diet-summary-card'
  const protSvg = createIcon(Droplet, 20, 2)
  protSvg.classList.add('color-info')
  prot.appendChild(protSvg)
  prot.innerHTML += '<span class="stat-label">Proteine</span><span class="stat-value">' + totalP + 'g</span>'
  summary.appendChild(prot)

  const carb = document.createElement('div')
  carb.className = 'diet-summary-card'
  const carbSvg = createIcon(Wheat, 20, 2)
  carbSvg.classList.add('color-warning')
  carb.appendChild(carbSvg)
  carb.innerHTML += '<span class="stat-label">Carbs</span><span class="stat-value">' + totalC + 'g</span>'
  summary.appendChild(carb)

  const gras = document.createElement('div')
  gras.className = 'diet-summary-card'
  const grasSvg = createIcon(CircleDot, 20, 2)
  grasSvg.classList.add('color-info')
  gras.appendChild(grasSvg)
  gras.innerHTML += '<span class="stat-label">Grassi</span><span class="stat-value">' + totalF + 'g</span>'
  summary.appendChild(gras)

  section.appendChild(summary)

  const list = document.createElement('div')
  list.className = 'meal-list'

  meals.forEach((m) => {
    const item = document.createElement('div')
    item.className = 'card meal-item'
    item.innerHTML = `<h3 class="card-title">${m.name}</h3>`
    const sub = document.createElement('p')
    sub.className = 'card-subtitle'
    sub.textContent = `${m.cal} cal`
    item.appendChild(sub)
    const macro = document.createElement('div')
    macro.className = 'meal-macro'
    macro.innerHTML = `<span style="color:var(--info)">P ${m.protein}g</span><span style="color:var(--warning)">C ${m.carbs}g</span><span style="color:var(--info)">G ${m.fat}g</span>`
    item.appendChild(macro)
    list.appendChild(item)
  })

  section.appendChild(list)
  return section
}

export { render }
export default render
