import { createIcon } from '/src/utils/icons.js'
import { ChevronLeft, ChevronRight, Droplet, Wheat, CircleDot, Sparkles, Upload, X, Save, Pencil, Trash2 } from 'lucide'
import { getNutritionTargets } from '/src/utils/nutritionTargets.js'
import { apiFetch } from '/src/utils/api.js'
import { macroProgressBar } from '/src/components/macroProgressBar.js'
import { mealSection } from '/src/components/mealSection.js'
import { addFoodModal } from '/src/components/addFoodModal.js'
import { generateDietFlow } from '/src/components/generateDietFlow.js'
import { uploadDietModal } from '/src/components/uploadDietModal.js'
import { dietPlanEditor } from '/src/components/dietPlanEditor.js'
import { dietPlanViewer } from '/src/components/dietPlanViewer.js'
import { loadingEl, errorEl } from '/src/utils/ui.js'
import { quickConfirm } from '/src/components/quickConfirm.js'
import { premiumUpsellModal } from '/src/components/premiumUpsellModal.js'
import { hasPremiumAccess } from '/src/utils/premium.js'

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
let activePlan = null
let expandedMeals = new Set(['pranzo', 'cena'])

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayDayIndex() {
  return (new Date().getDay() + 6) % 7
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

  try {
    const planData = await apiFetch('/diet-plans/active')
    activePlan = planData.dietPlan || null
  } catch {
    activePlan = null
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

  section.appendChild(buildPlanCard())

  const list = document.createElement('div')
  list.className = 'meal-sections'
  MEAL_DEFS.forEach((def) => {
    const typeMeals = meals.filter((m) => (m.type || 'snack') === def.id)
    const foods = typeMeals.flatMap((m) =>
      (m.foodItems || []).map((f) => ({
        id: f.id,
        mealId: m.id,
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
          onEdit: (food) => openEditFood(food),
          onDelete: (food) => confirmDeleteFood(food),
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
    premiumGate('Genera dieta con AI', () => generateDietFlow({ onSaveDiet: reload }))
  })
  section.appendChild(aiBtn)

  const uploadBtn = document.createElement('button')
  uploadBtn.className = 'btn btn-outline btn-full'
  uploadBtn.style.marginTop = 'var(--space-sm)'
  uploadBtn.appendChild(createIcon(Upload, 16, 2))
  const uploadLabel = document.createElement('span')
  uploadLabel.textContent = 'Carica dieta esistente'
  uploadBtn.appendChild(uploadLabel)
  uploadBtn.addEventListener('click', () => {
    premiumGate('Carica dieta esistente', openUploadDiet)
  })
  section.appendChild(uploadBtn)
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

function buildPlanCard() {
  const card = document.createElement('div')
  card.className = 'card diet-plan-card'

  const head = document.createElement('div')
  head.className = 'diet-plan-card-head'
  const title = document.createElement('h3')
  title.className = 'diet-plan-card-title'
  title.textContent = 'Piano di oggi'
  head.appendChild(title)
  card.appendChild(head)

  if (!activePlan) {
    const sub = document.createElement('p')
    sub.className = 'diet-plan-card-empty'
    sub.textContent = 'Nessun piano salvato: genera una dieta per ricevere i suggerimenti del giorno.'
    card.appendChild(sub)
    const genBtn = document.createElement('button')
    genBtn.className = 'btn btn-outline btn-full'
    genBtn.appendChild(createIcon(Sparkles, 16, 2))
    const genLabel = document.createElement('span')
    genLabel.textContent = 'Genera dieta'
    genBtn.appendChild(genLabel)
    genBtn.addEventListener('click', () => {
      premiumGate('Genera dieta con AI', () => generateDietFlow({ onSaveDiet: reload }))
    })
    card.appendChild(genBtn)
    return card
  }

  const dayIdx = todayDayIndex()
  const todayMeals = (activePlan.planMeals || []).filter((m) => m.dayIndex === dayIdx)
  const planned = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0)
  const logged = computeTotals(meals).cal

  const plannedLabel = document.createElement('p')
  plannedLabel.className = 'diet-plan-card-planned'
  plannedLabel.textContent = planned
    ? `${planned} kcal pianificate · ${logged} kcal registrate`
    : 'Nessun pasto pianificato per oggi'
  card.appendChild(plannedLabel)

  const planActions = document.createElement('div')
  planActions.className = 'diet-plan-actions'
  const viewBtn = document.createElement('button')
  viewBtn.className = 'btn btn-outline'
  viewBtn.style.flex = '1'
  viewBtn.appendChild(createIcon(ChevronRight, 16, 2))
  const viewLabel = document.createElement('span')
  viewLabel.textContent = 'Visualizza'
  viewBtn.appendChild(viewLabel)
  viewBtn.addEventListener('click', () => {
    dietPlanViewer({ plan: activePlan, onSaved: reload })
  })
  planActions.appendChild(viewBtn)
  const editBtn = document.createElement('button')
  editBtn.className = 'btn btn-outline'
  editBtn.style.flex = '1'
  editBtn.appendChild(createIcon(Pencil, 16, 2))
  const editLabel = document.createElement('span')
  editLabel.textContent = 'Modifica'
  editBtn.appendChild(editLabel)
  editBtn.addEventListener('click', () => {
    dietPlanEditor({ plan: activePlan, onSaved: reload })
  })
  planActions.appendChild(editBtn)
  const delBtn = document.createElement('button')
  delBtn.className = 'btn btn-danger'
  delBtn.style.flex = '1'
  delBtn.appendChild(createIcon(Trash2, 16, 2))
  const delLabel = document.createElement('span')
  delLabel.textContent = 'Elimina'
  delBtn.appendChild(delLabel)
  delBtn.addEventListener('click', () => {
    quickConfirm({
      message: 'Eliminare il piano alimentare?',
      confirmText: 'Elimina',
      onConfirm: async () => {
        try {
          await apiFetch('/diet-plans', { method: 'DELETE' })
          activePlan = null
          reload()
        } catch (err) {
          alert(err.message || "Errore nell'eliminazione del piano")
        }
      },
    })
  })
  planActions.appendChild(delBtn)
  card.appendChild(planActions)

  if (planned > 0) {
    const pct = Math.min(100, Math.round((logged / planned) * 100))
    const barRow = document.createElement('div')
    barRow.className = 'diet-plan-bar-row'
    const bar = document.createElement('div')
    bar.className = 'diet-plan-bar'
    const fill = document.createElement('div')
    fill.className = 'diet-plan-bar-fill'
    fill.style.width = `${Math.min(pct, 100)}%`
    bar.appendChild(fill)
    barRow.appendChild(bar)
    const pctLabel = document.createElement('span')
    pctLabel.className = 'diet-plan-bar-pct'
    pctLabel.textContent = `${pct}%`
    barRow.appendChild(pctLabel)
    card.appendChild(barRow)
  }

  if (!todayMeals.length) return card

  const mealWrap = document.createElement('div')
  mealWrap.className = 'diet-plan-meal-wrap'
  todayMeals.forEach((m) => {
    const row = document.createElement('div')
    row.className = 'diet-plan-meal'
    const type = document.createElement('span')
    type.className = 'diet-plan-meal-type'
    type.textContent = m.type || 'Pasto'
    row.appendChild(type)
    const kcal = document.createElement('span')
    kcal.className = 'diet-plan-meal-kcal'
    kcal.textContent = `${m.calories || 0} kcal`
    row.appendChild(kcal)
    const items = (m.items || []).map((it) => `${it.name} (${it.quantityG}g)`).join(', ')
    if (items) {
      const itList = document.createElement('span')
      itList.className = 'diet-plan-meal-items'
      itList.textContent = items
      row.appendChild(itList)
    }
    mealWrap.appendChild(row)
  })
  card.appendChild(mealWrap)

  return card
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
        const res = await apiFetch('/meals', {
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
                source: food.source || null,
                barcode: food.barcode || null,
              },
            ],
          }),
        })
        expandedMeals.add(type)
        upsertMeal(res.meal)
        paint()
      } catch (err) {
        alert(err.message || 'Errore nel salvataggio del pasto')
      }
    },
  })
}

function upsertMeal(meal) {
  if (!meal) return
  const idx = meals.findIndex((m) => m.id === meal.id)
  if (idx === -1) meals.push(meal)
  else meals[idx] = meal
}

function openEditFood(food) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay edit-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-sm'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = `Modifica quantità`
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const nameP = document.createElement('p')
  nameP.className = 'edit-food-name'
  nameP.textContent = food.name
  body.appendChild(nameP)

  const qtyGroup = document.createElement('div')
  qtyGroup.className = 'input-group'
  qtyGroup.innerHTML = '<label for="edit-qty">Quantità (g)</label>'
  const qtyInput = document.createElement('input')
  qtyInput.type = 'number'
  qtyInput.id = 'edit-qty'
  qtyInput.className = 'input'
  qtyInput.value = String(food.qty)
  qtyGroup.appendChild(qtyInput)
  body.appendChild(qtyGroup)

  const computedEl = document.createElement('p')
  computedEl.className = 'edit-computed'
  body.appendChild(computedEl)

  function recompute() {
    const newQty = Number(qtyInput.value) || 0
    const f = food.qty ? newQty / food.qty : newQty / 100
    computedEl.textContent = `${Math.round((food.cal || 0) * f)} kcal · P ${((food.protein || 0) * f).toFixed(1)}g · C ${((food.carbs || 0) * f).toFixed(1)}g · G ${((food.fat || 0) * f).toFixed(1)}g`
  }
  recompute()
  qtyInput.addEventListener('input', recompute)

  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const sLabel = document.createElement('span')
  sLabel.textContent = 'Aggiorna'
  saveBtn.appendChild(sLabel)
  saveBtn.addEventListener('click', async () => {
    const newQty = Number(qtyInput.value) || 0
    if (newQty === food.qty) return close()
    const f = food.qty ? newQty / food.qty : 1
    try {
      const res = await apiFetch(`/meals/${food.mealId}/foods/${food.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          quantityG: newQty,
          calories: Math.round((food.cal || 0) * f),
          proteinG: Math.round((food.protein || 0) * f * 10) / 10,
          carbsG: Math.round((food.carbs || 0) * f * 10) / 10,
          fatsG: Math.round((food.fat || 0) * f * 10) / 10,
        }),
      })
      upsertMeal(res.meal)
      paint()
      close()
    } catch (err) {
      alert(err.message || 'Errore nell\'aggiornamento')
    }
  })
  body.appendChild(saveBtn)
  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    if (overlay.parentNode) document.body.removeChild(overlay)
  }
}

function confirmDeleteFood(food) {
  quickConfirm({
    message: `Rimuovere ${food.name} dal pasto?`,
    confirmText: 'Rimuovi',
    onConfirm: async () => {
      try {
        const res = await apiFetch(`/meals/${food.mealId}/foods/${food.id}`, {
          method: 'DELETE',
        })
        if (!res.meal) meals = meals.filter((m) => m.id !== food.mealId)
        else upsertMeal(res.meal)
        paint()
      } catch (err) {
        alert(err.message || 'Errore nell\'eliminazione')
      }
    },
  })
}

function openUploadDiet() {
  uploadDietModal({ onSaved: reload })
}

function premiumGate(label, open) {
  if (!hasPremiumAccess()) {
    premiumUpsellModal({ title: label })
    return
  }
  open()
}

export { render }
export default render