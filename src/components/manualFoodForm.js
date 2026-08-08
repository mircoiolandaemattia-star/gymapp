import { createIcon } from '/src/utils/icons.js'
import { X, Save, Search, ChevronRight, ClipboardEdit } from 'lucide'
import { searchFoods } from '/src/mock/commonFoods.js'
import { getRecentFoods, addRecentFood } from '/src/utils/recentFoods.js'
import { mealContext } from '/src/components/mealContext.js'

function manualFoodForm({ mealName, onFoodAdded }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Inserimento manuale'
  header.appendChild(hTitle)
  header.appendChild(mealContext(mealName))
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const state = {
    search: '',
    selected: null,
    qty: 100,
  }

  const searchWrap = document.createElement('div')
  searchWrap.className = 'input-group mf-search-wrap'
  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.className = 'input'
  searchInput.placeholder = 'Cerca un alimento (es. pollo)'
  searchInput.setAttribute('autocomplete', 'off')
  searchWrap.appendChild(searchInput)
  body.appendChild(searchWrap)

  const results = document.createElement('div')
  results.className = 'mf-results'
  body.appendChild(results)

  const detail = document.createElement('div')
  detail.className = 'mf-detail'
  detail.style.display = 'none'
  body.appendChild(detail)

  function backToSearch() {
    state.selected = null
    state.qty = 100
    detail.style.display = 'none'
    results.style.display = 'block'
    renderResults()
  }

  function foodRow(food, { meta } = {}) {
    const row = document.createElement('button')
    row.type = 'button'
    row.className = 'mf-row'
    const name = document.createElement('span')
    name.className = 'mf-row-name'
    name.textContent = food.name
    row.appendChild(name)
    const sub = document.createElement('span')
    sub.className = 'mf-row-meta'
    sub.textContent = meta || `${food.caloriesPer100g} kcal · ${food.fatsPer100g}g grassi per 100g`
    row.appendChild(sub)
    row.appendChild(createIcon(ChevronRight, 16, 1.5))
    row.addEventListener('click', () => selectFood(food))
    return row
  }

  function renderResults() {
    results.innerHTML = ''
    const q = state.search.trim()

    if (!q) {
      const recent = getRecentFoods()
      if (recent.length) {
        const h = document.createElement('p')
        h.className = 'mf-section-title'
        h.textContent = 'Usati di recente'
        results.appendChild(h)
        recent.forEach((f) => results.appendChild(foodRow(f)))
      } else {
        const hint = document.createElement('p')
        hint.className = 'mf-empty-hint'
        hint.textContent = 'Digita per cercare tra gli alimenti comuni.'
        results.appendChild(hint)
      }
      appendFreeOption()
      return
    }

    const matches = searchFoods(q)
    if (matches.length) {
      const h = document.createElement('p')
      h.className = 'mf-section-title'
      h.textContent = 'Risultati'
      results.appendChild(h)
      matches.forEach((f) => results.appendChild(foodRow(f)))
    } else {
      const empty = document.createElement('p')
      empty.className = 'mf-empty-hint'
      empty.textContent = `Nessun alimento trovato per "${q}".`
      results.appendChild(empty)
    }
    appendFreeOption()
  }

  function appendFreeOption() {
    const freeBtn = document.createElement('button')
    freeBtn.type = 'button'
    freeBtn.className = 'mf-free-row'
    const icon = createIcon(ClipboardEdit, 16, 1.5)
    freeBtn.appendChild(icon)
    const label = document.createElement('span')
    label.textContent = 'Non trovi l\'alimento? Inseriscilo manualmente'
    freeBtn.appendChild(label)
    freeBtn.appendChild(createIcon(ChevronRight, 16, 1.5))
    freeBtn.addEventListener('click', openFreeForm)
    results.appendChild(freeBtn)
  }

  function selectFood(food) {
    state.selected = food
    state.qty = 100
    results.style.display = 'none'
    detail.style.display = 'block'
    renderDetail()
  }

  function renderDetail() {
    const food = state.selected
    if (!food) return
    detail.innerHTML = ''

    const backRow = document.createElement('button')
    backRow.type = 'button'
    backRow.className = 'mf-back'
    backRow.textContent = '← Cambia alimento'
    backRow.addEventListener('click', backToSearch)
    detail.appendChild(backRow)

    const box = document.createElement('div')
    box.className = 'card mf-food-card'

    const name = document.createElement('h3')
    name.className = 'mf-food-name'
    name.textContent = food.name
    box.appendChild(name)

    const per100 = document.createElement('p')
    per100.className = 'mf-food-per100'
    per100.textContent = `Valori per 100g: ${food.caloriesPer100g} kcal · P ${food.proteinPer100g}g · C ${food.carbsPer100g}g · G ${food.fatsPer100g}g`
    box.appendChild(per100)

    const qtyGroup = document.createElement('div')
    qtyGroup.className = 'input-group'
    qtyGroup.innerHTML = '<label for="mf-qty">Quantità consumata (g)</label>'
    const qtyInput = document.createElement('input')
    qtyInput.type = 'number'
    qtyInput.id = 'mf-qty'
    qtyInput.className = 'input'
    qtyInput.value = String(state.qty)
    qtyGroup.appendChild(qtyInput)
    box.appendChild(qtyGroup)

    const quick = document.createElement('div')
    quick.className = 'mf-quick'
    ;[30, 100, 150, 200].forEach((v) => {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'chip'
      chip.textContent = `${v}g`
      chip.addEventListener('click', () => {
        state.qty = v
        qtyInput.value = String(v)
        updateComputed()
      })
      quick.appendChild(chip)
    })
    box.appendChild(quick)

    const computed = document.createElement('div')
    computed.className = 'mf-computed'
    box.appendChild(computed)

    function updateComputed() {
      const q = Number(qtyInput.value) || 0
      state.qty = q
      const f = q / 100
      const vals = [
        `${Math.round(food.caloriesPer100g * f)} kcal`,
        `P ${(food.proteinPer100g * f).toFixed(1)}g`,
        `C ${(food.carbsPer100g * f).toFixed(1)}g`,
        `G ${(food.fatsPer100g * f).toFixed(1)}g`,
      ]
      computed.textContent = vals.join(' · ')
    }
    updateComputed()
    qtyInput.addEventListener('input', updateComputed)
    detail.appendChild(box)

    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'btn btn-primary btn-full'
    confirmBtn.appendChild(createIcon(Save, 16, 2))
    const cLabel = document.createElement('span')
    cLabel.textContent = 'Conferma'
    confirmBtn.appendChild(cLabel)
    confirmBtn.addEventListener('click', () => {
      const f = state.qty / 100
      addFood({
        name: food.name,
        qty: state.qty,
        cal: Math.round(food.caloriesPer100g * f),
        protein: Math.round(food.proteinPer100g * f * 10) / 10,
        carbs: Math.round(food.carbsPer100g * f * 10) / 10,
        fat: Math.round(food.fatsPer100g * f * 10) / 10,
        source: 'common',
      })
    })
    detail.appendChild(confirmBtn)
  }

  function openFreeForm() {
    state.selected = null
    results.style.display = 'none'
    detail.style.display = 'block'
    detail.innerHTML = ''

    const backRow = document.createElement('button')
    backRow.type = 'button'
    backRow.className = 'mf-back'
    backRow.textContent = '← Cerca di nuovo'
    backRow.addEventListener('click', backToSearch)
    detail.appendChild(backRow)

    const grid = document.createElement('div')
    grid.className = 'macro-input-grid'
    const fields = [
      { key: 'name', label: 'Nome alimento', type: 'text', def: '' },
      { key: 'qty', label: 'Quantità (g)', type: 'number', def: '100' },
      { key: 'cal', label: 'Calorie (kcal)', type: 'number', def: '200' },
      { key: 'protein', label: 'Proteine (g)', type: 'number', def: '20' },
      { key: 'carbs', label: 'Carboidrati (g)', type: 'number', def: '10' },
      { key: 'fat', label: 'Grassi (g)', type: 'number', def: '5' },
    ]
    const inputs = {}
    fields.forEach((f) => {
      const g = document.createElement('div')
      g.className = f.key === 'name' ? 'input-group' : 'input-group'
      g.innerHTML = `<label for="ff-${f.key}">${f.label}</label>`
      const inp = document.createElement('input')
      inp.type = f.type
      inp.id = `ff-${f.key}`
      inp.className = f.key === 'name' ? 'input' : 'input input-sm'
      inp.value = f.def
      g.appendChild(inp)
      grid.appendChild(g)
      inputs[f.key] = inp
    })
    detail.appendChild(grid)

    const saveBtn = document.createElement('button')
    saveBtn.className = 'btn btn-primary btn-full'
    saveBtn.appendChild(createIcon(Save, 16, 2))
    const sLabel = document.createElement('span')
    sLabel.textContent = 'Salva alimento'
    saveBtn.appendChild(sLabel)
    saveBtn.addEventListener('click', () => {
      addFood({
        name: inputs.name.value.trim() || 'Alimento',
        qty: Number(inputs.qty.value) || 0,
        cal: Number(inputs.cal.value) || 0,
        protein: Number(inputs.protein.value) || 0,
        carbs: Number(inputs.carbs.value) || 0,
        fat: Number(inputs.fat.value) || 0,
      })
    })
    detail.appendChild(saveBtn)
  }

  function addFood(food) {
    if (food.source === 'common') addRecentFood2(food)
    onFoodAdded(food)
    close()
  }

  function addRecentFood2(food) {
    if (!food.qty) return
    const f = 100 / food.qty
    addRecentFood({
      name: food.name,
      caloriesPer100g: food.cal * f,
      proteinPer100g: food.protein * f,
      carbsPer100g: food.carbs * f,
      fatsPer100g: food.fat * f,
    })
  }

  searchInput.addEventListener('input', () => {
    state.search = searchInput.value
    renderResults()
  })

  renderResults()
  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { manualFoodForm }