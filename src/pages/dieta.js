import { createIcon } from '/src/utils/icons.js'
import { ChevronLeft, ChevronRight, Droplet, Wheat, CircleDot, Sparkles } from 'lucide'
import { dietDays, todayIndex, macroTargets } from '/src/mock/dietData.js'
import { macroProgressBar } from '/src/components/macroProgressBar.js'
import { mealSection } from '/src/components/mealSection.js'
import { addFoodModal } from '/src/components/addFoodModal.js'
import { generateDietFlow } from '/src/components/generateDietFlow.js'

let currentIndex = todayIndex
let expandedMeals = new Set(['pranzo', 'cena'])
let currentSection = null

function render() {
  const section = buildSection()
  if (currentSection && currentSection.isConnected) {
    currentSection.replaceWith(section)
  }
  currentSection = section
  return section
}

function buildSection() {
  const section = document.createElement('section')
  section.className = 'page dieta-page'

  const day = dietDays[currentIndex]

  const header = document.createElement('div')
  header.className = 'page-header dieta-header'
  const hTitle = document.createElement('h1')
  hTitle.className = 'page-title'
  hTitle.textContent = 'Dieta'
  header.appendChild(hTitle)
  const hSub = document.createElement('p')
  hSub.className = 'page-subtitle'
  hSub.textContent = 'Piano alimentare'
  header.appendChild(hSub)
  section.appendChild(header)

  const daySel = document.createElement('div')
  daySel.className = 'day-selector'

  const prevBtn = document.createElement('button')
  prevBtn.className = 'day-selector-btn'
  prevBtn.setAttribute('aria-label', 'Giorno precedente')
  prevBtn.appendChild(createIcon(ChevronLeft, 20, 2))
  prevBtn.disabled = currentIndex === 0
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; render() }
  })
  daySel.appendChild(prevBtn)

  const dayLabel = document.createElement('span')
  dayLabel.className = 'day-selector-label'
  dayLabel.textContent = day.isToday ? 'Oggi' : day.label
  daySel.appendChild(dayLabel)

  const nextBtn = document.createElement('button')
  nextBtn.className = 'day-selector-btn'
  nextBtn.setAttribute('aria-label', 'Giorno successivo')
  nextBtn.appendChild(createIcon(ChevronRight, 20, 2))
  nextBtn.disabled = currentIndex === dietDays.length - 1
  nextBtn.addEventListener('click', () => {
    if (currentIndex < dietDays.length - 1) { currentIndex++; render() }
  })
  daySel.appendChild(nextBtn)

  section.appendChild(daySel)

  const totals = day.meals.reduce((acc, m) => {
    m.foods.forEach((f) => {
      acc.cal += f.cal
      acc.protein += f.protein
      acc.carbs += f.carbs
      acc.fat += f.fat
    })
    return acc
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 })

  const macroCard = document.createElement('div')
  macroCard.className = 'card macro-card'

  const macroTop = document.createElement('div')
  macroTop.className = 'macro-top'
  const macroLabel = document.createElement('span')
  macroLabel.className = 'macro-top-label'
  macroLabel.textContent = 'Macronutrienti'
  macroTop.appendChild(macroLabel)
  const macroTotal = document.createElement('span')
  macroTotal.className = 'macro-top-total'
  const macroValue = document.createElement('span')
  macroValue.className = 'macro-top-value'
  macroValue.textContent = String(Math.round(totals.cal))
  macroTotal.appendChild(macroValue)
  const macroTarget = document.createElement('span')
  macroTarget.className = 'macro-top-target'
  macroTarget.textContent = ` / ${macroTargets.calories} kcal`
  macroTotal.appendChild(macroTarget)
  macroTop.appendChild(macroTotal)
  macroCard.appendChild(macroTop)

  const bars = [
    { label: 'Proteine', icon: Droplet, color: 'var(--info)', value: Math.round(totals.protein), target: macroTargets.protein },
    { label: 'Carboidrati', icon: Wheat, color: 'var(--warning)', value: Math.round(totals.carbs), target: macroTargets.carbs },
    { label: 'Grassi', icon: CircleDot, color: 'var(--error)', value: Math.round(totals.fat), target: macroTargets.fat },
  ]
  bars.forEach((b) => {
    macroCard.appendChild(macroProgressBar(b))
  })
  section.appendChild(macroCard)

  const list = document.createElement('div')
  list.className = 'meal-sections'
  day.meals.forEach((m) => {
    list.appendChild(mealSection(m, {
      expanded: expandedMeals.has(m.id),
      onToggle: () => {
        if (expandedMeals.has(m.id)) expandedMeals.delete(m.id)
        else expandedMeals.add(m.id)
        render()
      },
      onAdd: () => openAddFood(m),
    }))
  })
  section.appendChild(list)

  const aiBtn = document.createElement('button')
  aiBtn.className = 'btn btn-primary btn-full diet-ai-btn'
  aiBtn.appendChild(createIcon(Sparkles, 16, 2))
  const aiLabel = document.createElement('span')
  aiLabel.textContent = 'Genera dieta con AI'
  aiBtn.appendChild(aiLabel)
  aiBtn.addEventListener('click', () => {
    generateDietFlow({ onSaveDiet: applyGeneratedDiet })
  })
  section.appendChild(aiBtn)

  return section
}

function openAddFood(meal) {
  addFoodModal({
    mealName: meal.name,
    onFoodAdded: (food) => {
      meal.foods.push(food)
      render()
    },
  })
}

function applyGeneratedDiet() {
  const day = dietDays[currentIndex]
  day.meals = [
    {
      id: 'colazione', name: 'Colazione', color: 'var(--warning)',
      foods: [{ name: 'Avena con frutta', qty: 80, cal: 320, protein: 15, carbs: 55, fat: 5 }],
    },
    {
      id: 'pranzo', name: 'Pranzo', color: 'var(--error)',
      foods: [{ name: 'Pollo e riso', qty: 300, cal: 520, protein: 40, carbs: 65, fat: 8 }],
    },
    {
      id: 'cena', name: 'Cena', color: 'var(--info)',
      foods: [{ name: 'Salmone e verdure', qty: 320, cal: 480, protein: 38, carbs: 20, fat: 22 }],
    },
  ]
  expandedMeals = new Set(['pranzo'])
  render()
}

export { render }
export default render
