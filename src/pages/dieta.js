import { createIcon } from '/src/utils/icons.js'
import { ChevronLeft, ChevronRight, Droplet, Wheat, CircleDot, Sparkles } from 'lucide'
import { getNutritionTargets } from '/src/utils/nutritionTargets.js'
import { apiFetch } from '/src/utils/api.js'
import { macroProgressBar } from '/src/components/macroProgressBar.js'
import { mealSection } from '/src/components/mealSection.js'
import { addFoodModal } from '/src/components/addFoodModal.js'
import { generateDietFlow } from '/src/components/generateDietFlow.js'
import { loadingEl, errorEl } from '/src/utils/ui.js'

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const MEAL_DEFS = [
  { id: 'colazione', name: 'Colazione', color: 'var(--warning)' },
  { id: 'pranzo', name: 'Pranzo', color: 'var(--error)' },
  { id: 'cena', name: 'Cena', color: 'var(--info)' },
  { id: 'snack', name: 'Snack', color: 'var(--accent)' },
]

let section = null
let selectedDate = todayIso()
let loadedDate = null
let loading = false
let meals = []
let loadError = null
let expandedMeals = new Set(['pranzo', 'cena'])

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDaysIso(offset) {
  const d = new Date(selectedDate + 'T00:00:00')
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isToday(iso) {
  return iso === todayIso()
}

function shortLabel(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function targets() {
  const t = getNutritionTargets()
  return {
    calories: t.calories,
    protein: t.protein,
    carbs: t.carbs,
    fat: t.fats,
  }
}

function render() {
  if (!section) {
    section = document.createElement('section')
    section.className = 'page dieta-page'
  }
  refresh()
  return section
}

function refresh() {
  if (!section) return
  if (loadedDate !== selectedDate && !loading) {
    load()
  } else {
    paint()
  }
}

async function load() {
  if (loading) return
  const sec = section
  if (!sec) return
  loading = true
  loadError = null
  paint()
  try {
    const data = await apiFetch(`/meals?date=${selectedDate}`)
    meals = data.meals || []
    loadedDate = selectedDate
  } catch (err) {
    meals = []
    loadedDate = selectedDate
    loadError = err.message
  }
  loading = false
  if (section === sec) paint()
}

function paint() {
  if (!section) return
  section.innerHTML = ''

  buildHeader(section)

  if (loadedDate !== selectedDate) {
    section.appendChild(loadingEl('Caricamento pasti...'))
    return
  }

  if (loadError) {
    const errCard = errorEl(loadError)
    errCard.retry.addEventListener('click', () => reload())
    section.appendChild(errCard.el)
  }

  const t = targets()
  const totals = computeTotals(meals)

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
  macroTarget.textContent = ` / ${t.calories} kcal`
  macroTotal.appendChild(macroTarget)
  macroTop.appendChild(macroTotal)
  macroCard.appendChild(macroTop)

  const bars = [
    { label: 'Proteine', icon: Droplet, color: 'var(--info)', value: Math.round(totals.protein), target: t.protein },
    { label: 'Carboidrati', icon: Wheat, color: 'var(--warning)', value: Math.round(totals.carbs), target: t.carbs },
    { label: 'Grassi', icon: CircleDot, color: 'var(--error)', value: Math.round(totals.fat), target: t.fat },
  ]
  bars.forEach((b) => {
    macroCard.appendChild(macroProgressBar(b))
  })
  section.appendChild(macroCard)

  const list = document.createElement('div')
  list.className = 'meal-sections'
  MEAL_DEFS.forEach((def) => {
    const typeMeals = meals.filter((m) => (m.type || 'snack') === def.id)
    const foods = typeMeals.flatMap((m) =>
      (m.foodItems || []).map((f) => ({
        name: f.name,
        qty: f.quantityG ?? 0,
        cal: f.calories ?? 0,
        protein: f.proteinG ?? 0,
        carbs: f.carbsG ?? 0,
        fat: f.fatsG ?? 0,
      }))
    )
    list.appendChild(
      mealSection(
        { id: def.id, name: def.name, color: def.color, foods },
        {
          expanded: expandedMeals.has(def.id),
          onToggle: () => {
            if (expandedMeals.has(def.id)) expandedMeals.delete(def.id)
            else expandedMeals.add(def.id)
            paint()
          },
          onAdd: () => openAddFood(def.id, def.name),
        }
      )
    )
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
}

function buildHeader(parent) {
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
  parent.appendChild(header)

  const daySel = document.createElement('div')
  daySel.className = 'day-selector'

  const prevBtn = document.createElement('button')
  prevBtn.className = 'day-selector-btn'
  prevBtn.setAttribute('aria-label', 'Giorno precedente')
  prevBtn.appendChild(createIcon(ChevronLeft, 20, 2))
  prevBtn.addEventListener('click', () => {
    selectedDate = addDaysIso(-1)
    refresh()
  })
  daySel.appendChild(prevBtn)

  const dayLabel = document.createElement('span')
  dayLabel.className = 'day-selector-label'
  dayLabel.textContent = isToday(selectedDate) ? 'Oggi' : shortLabel(selectedDate)
  daySel.appendChild(dayLabel)

  const nextBtn = document.createElement('button')
  nextBtn.className = 'day-selector-btn'
  nextBtn.setAttribute('aria-label', 'Giorno successivo')
  nextBtn.appendChild(createIcon(ChevronRight, 20, 2))
  nextBtn.addEventListener('click', () => {
    selectedDate = addDaysIso(1)
    refresh()
  })
  daySel.appendChild(nextBtn)

  parent.appendChild(daySel)
}

function computeTotals(meals) {
  return meals.reduce(
    (acc, m) => {
      acc.cal += m.totalCalories || 0
      ;(m.foodItems || []).forEach((f) => {
        acc.protein += f.proteinG || 0
        acc.carbs += f.carbsG || 0
        acc.fat += f.fatsG || 0
      })
      return acc
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

function reload() {
  loadedDate = null
  refresh()
}

function openAddFood(type, typeName) {
  addFoodModal({
    mealName: typeName,
    onFoodAdded: async (food) => {
      try {
        await apiFetch('/meals', {
          method: 'POST',
          body: JSON.stringify({
            type,
            date: selectedDate,
            totalCalories: Math.round(food.cal || 0),
            foodItems: [
              {
                name: food.name,
                quantityG: food.qty != null ? Number(food.qty) : null,
                calories: Math.round(food.cal || 0),
                proteinG: food.protein || 0,
                carbsG: food.carbs || 0,
                fatsG: food.fat || 0,
              },
            ],
          }),
        })
        await reload()
      } catch (err) {
        alert(err.message || 'Errore nel salvataggio del pasto')
      }
    },
  })
}

async function applyGeneratedDiet() {
  const generated = [
    { type: 'colazione', name: 'Avena con frutta', qty: 80, cal: 320, protein: 15, carbs: 55, fat: 5 },
    { type: 'pranzo', name: 'Pollo e riso', qty: 300, cal: 520, protein: 40, carbs: 65, fat: 8 },
    { type: 'cena', name: 'Salmone e verdure', qty: 320, cal: 480, protein: 38, carbs: 20, fat: 22 },
  ]

  try {
    for (const meal of generated) {
      await apiFetch('/meals', {
        method: 'POST',
        body: JSON.stringify({
          type: meal.type,
          date: selectedDate,
          totalCalories: meal.cal,
          foodItems: [
            {
              name: meal.name,
              quantityG: meal.qty,
              calories: meal.cal,
              proteinG: meal.protein,
              carbsG: meal.carbs,
              fatsG: meal.fat,
            },
          ],
        }),
      })
    }
    expandedMeals = new Set(['pranzo'])
    await reload()
  } catch (err) {
    alert(err.message || 'Errore nel salvataggio della dieta')
  }
}

export { render }
export default render