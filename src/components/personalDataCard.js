import { createIcon } from '/src/utils/icons.js'
import { Pencil, Save, Activity, TrendingDown, Ruler, User } from 'lucide'

const ROWS = [
  { key: 'eta', label: 'Età', unit: 'anni', icon: Activity, step: '1' },
  { key: 'peso', label: 'Peso', unit: 'kg', icon: TrendingDown, step: '0.1' },
  { key: 'altezza', label: 'Altezza', unit: 'cm', icon: Ruler, step: '1' },
]

function personalDataCard({ data, editing, onEdit, onSave, onCancel }) {
  const card = document.createElement('div')
  card.className = 'card'

  const head = document.createElement('div')
  head.className = 'section-header'
  head.style.cssText = 'margin-bottom:var(--space-sm)'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Dati personali'
  head.appendChild(title)
  if (!editing) {
    const editBtn = document.createElement('button')
    editBtn.className = 'profile-edit-btn'
    editBtn.appendChild(createIcon(Pencil, 14, 2))
    const span = document.createElement('span')
    span.textContent = 'Modifica'
    editBtn.appendChild(span)
    editBtn.addEventListener('click', onEdit)
    head.appendChild(editBtn)
  }
  card.appendChild(head)

  if (!editing) {
    ROWS.forEach(({ key, label, unit, icon }) => {
      const row = document.createElement('div')
      row.className = 'data-row'
      const iconBox = document.createElement('div')
      iconBox.className = 'data-icon'
      iconBox.appendChild(createIcon(icon, 16, 2))
      row.appendChild(iconBox)
      const l = document.createElement('span')
      l.className = 'data-label'
      l.textContent = label
      row.appendChild(l)
      const v = document.createElement('span')
      v.className = 'data-value'
      v.textContent = `${data[key]} ${unit}`
      row.appendChild(v)
      card.appendChild(row)
    })

    const sexRow = document.createElement('div')
    sexRow.className = 'data-row'
    const iconBox = document.createElement('div')
    iconBox.className = 'data-icon'
    iconBox.appendChild(createIcon(User, 16, 2))
    sexRow.appendChild(iconBox)
    const l = document.createElement('span')
    l.className = 'data-label'
    l.textContent = 'Sesso'
    sexRow.appendChild(l)
    const v = document.createElement('span')
    v.className = 'data-value'
    v.textContent = data.sesso === 'M' ? 'Maschio' : 'Femmina'
    sexRow.appendChild(v)
    card.appendChild(sexRow)
  } else {
    const grid = document.createElement('div')
    grid.className = 'data-edit-grid'
    const inputs = {}

    ROWS.forEach(({ key, label, unit, step }) => {
      const g = document.createElement('div')
      g.className = 'input-group'
      g.style.cssText = 'margin-bottom:0'
      g.innerHTML = `<label for="pd-${key}">${label} (${unit})</label>`
      const inp = document.createElement('input')
      inp.type = 'number'
      inp.id = `pd-${key}`
      inp.className = 'input input-sm'
      inp.step = step
      inp.value = String(data[key])
      g.appendChild(inp)
      grid.appendChild(g)
      inputs[key] = inp
    })

    const sexG = document.createElement('div')
    sexG.className = 'input-group'
    sexG.style.cssText = 'margin-bottom:0'
    sexG.innerHTML = '<label for="pd-sesso">Sesso</label>'
    const sel = document.createElement('select')
    sel.id = 'pd-sesso'
    sel.className = 'input input-sm input-select'
    const o1 = document.createElement('option')
    o1.value = 'M'
    o1.textContent = 'Maschio'
    const o2 = document.createElement('option')
    o2.value = 'F'
    o2.textContent = 'Femmina'
    sel.appendChild(o1)
    sel.appendChild(o2)
    sel.value = data.sesso
    sexG.appendChild(sel)
    grid.appendChild(sexG)
    card.appendChild(grid)

    const actions = document.createElement('div')
    actions.className = 'data-actions'
    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'btn btn-outline'
    cancelBtn.textContent = 'Annulla'
    cancelBtn.addEventListener('click', onCancel)
    actions.appendChild(cancelBtn)
    const saveBtn = document.createElement('button')
    saveBtn.className = 'btn btn-primary'
    saveBtn.appendChild(createIcon(Save, 16, 2))
    const s = document.createElement('span')
    s.textContent = 'Salva'
    saveBtn.appendChild(s)
    saveBtn.addEventListener('click', () => {
      const out = {}
      let ok = true
      ROWS.forEach(({ key }) => {
        const num = Number(inputs[key].value)
        if (!inputs[key].value.trim() || !(num > 0)) {
          inputs[key].style.borderColor = 'var(--error)'
          ok = false
        } else {
          out[key] = num
        }
      })
      if (!ok) return
      out.sesso = sel.value
      onSave(out)
    })
    actions.appendChild(saveBtn)
    card.appendChild(actions)
  }

  return card
}

export { personalDataCard }
