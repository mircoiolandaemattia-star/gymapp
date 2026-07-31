import { createIcon } from '/src/utils/icons.js'
import { X, Save } from 'lucide'

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
  nameGroup.appendChild(nameInput)
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
  })
  body.appendChild(grid)

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
