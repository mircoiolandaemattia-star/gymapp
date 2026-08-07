import { createIcon } from '/src/utils/icons.js'
import { X, Save, Search } from 'lucide'
import { apiFetch } from '/src/utils/api.js'

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
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const nameGroup = document.createElement('div')
  nameGroup.className = 'input-group'
  nameGroup.innerHTML = '<label for="mf-name">Nome alimento</label>'
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.id = 'mf-name'
  nameInput.className = 'input'
  nameInput.placeholder = 'es. Petto di pollo'
  nameInput.setAttribute('autocomplete', 'off')
  nameGroup.appendChild(nameInput)

  const suggestBox = document.createElement('div')
  suggestBox.className = 'mf-suggest'
  suggestBox.style.display = 'none'
  nameGroup.appendChild(suggestBox)
  body.appendChild(nameGroup)

  const grid = document.createElement('div')
  grid.className = 'macro-input-grid'
  const fields = [
    { key: 'qty', label: 'Quantità (g)', type: 'number', def: 100 },
    { key: 'cal', label: 'Calorie (kcal)', type: 'number', def: 200 },
    { key: 'protein', label: 'Proteine (g)', type: 'number', def: 20 },
    { key: 'carbs', label: 'Carboidrati (g)', type: 'number', def: 10 },
    { key: 'fat', label: 'Grassi (g)', type: 'number', def: 5 },
  ]
  const values = {}
  const inputs = {}
  fields.forEach((f) => {
    const g = document.createElement('div')
    g.className = 'input-group'
    g.innerHTML = `<label for="mf-${f.key}">${f.label}</label>`
    const inp = document.createElement('input')
    inp.type = f.type
    inp.id = `mf-${f.key}`
    inp.className = 'input input-sm'
    inp.value = String(f.def)
    inp.addEventListener('input', () => { values[f.key] = Number(inp.value) || 0 })
    g.appendChild(inp)
    grid.appendChild(g)
    values[f.key] = f.def
    inputs[f.key] = inp
  })
  body.appendChild(grid)

  let searchTimer = null
  let pendingSearch = 0

  function hideSuggest() {
    suggestBox.style.display = 'none'
  }

  function setFromSuggestion(item) {
    const qty = Number(values.qty) || 100
    const f = qty / 100
    nameInput.value = item.name
    inputs.qty.value = String(qty)
    inputs.cal.value = String(Math.round(item.caloriesPer100g * f))
    inputs.protein.value = String(Math.round(item.proteinPer100g * f * 10) / 10)
    inputs.carbs.value = String(Math.round(item.carbsPer100g * f * 10) / 10)
    inputs.fat.value = String(Math.round(item.fatsPer100g * f * 10) / 10)
    values.qty = qty
    values.cal = Math.round(item.caloriesPer100g * f)
    values.protein = Math.round(item.proteinPer100g * f * 10) / 10
    values.carbs = Math.round(item.carbsPer100g * f * 10) / 10
    values.fat = Math.round(item.fatsPer100g * f * 10) / 10
    hideSuggest()
  }

  nameInput.addEventListener('input', () => {
    clearTimeout(searchTimer)
    const q = nameInput.value.trim()
    if (q.length < 2) {
      hideSuggest()
      return
    }
    const myId = ++pendingSearch
    searchTimer = setTimeout(async () => {
      try {
        const data = await apiFetch(`/food/search?q=${encodeURIComponent(q)}`)
        if (myId !== pendingSearch) return
        const results = (data.results || []).slice(0, 5)
        suggestBox.innerHTML = ''
        if (!results.length) {
          hideSuggest()
          return
        }
        results.forEach((item) => {
          const row = document.createElement('button')
          row.type = 'button'
          row.className = 'mf-suggest-item'
          const name = document.createElement('span')
          name.className = 'mf-suggest-name'
          name.textContent = item.name
          row.appendChild(name)
          const meta = document.createElement('span')
          meta.className = 'mf-suggest-meta'
          meta.textContent = item.brand ? `${item.brand} · ` : ''
          meta.textContent += `${item.caloriesPer100g} kcal/100g`
          row.appendChild(meta)
          row.addEventListener('click', () => setFromSuggestion(item))
          suggestBox.appendChild(row)
        })
        suggestBox.style.display = 'block'
      } catch {
        hideSuggest()
      }
    }, 350)
  })

  nameInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (!suggestBox.contains(document.activeElement)) hideSuggest()
    }, 200)
  })

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const sLabel = document.createElement('span')
  sLabel.textContent = 'Salva'
  saveBtn.appendChild(sLabel)
  saveBtn.addEventListener('click', () => {
    onFoodAdded({
      name: nameInput.value.trim() || 'Alimento',
      qty: values.qty,
      cal: values.cal,
      protein: values.protein,
      carbs: values.carbs,
      fat: values.fat,
    })
    close()
  })
  footer.appendChild(saveBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { manualFoodForm }