import { createIcon } from '/src/utils/icons.js'
import { X, Save } from 'lucide'

const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

function todayLabel() {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function addMeasurementModal({ current, onSave }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-scroll'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Aggiungi misurazione'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const OPTIONAL_FIELDS = [
    { key: 'vita', label: 'Vita (cm)' },
    { key: 'fianchi', label: 'Fianchi (cm)' },
    { key: 'petto', label: 'Petto (cm)' },
    { key: 'braccia', label: 'Braccia (cm)' },
  ]

  const inputs = {}

  const pesoGroup = document.createElement('div')
  pesoGroup.className = 'input-group'
  pesoGroup.innerHTML = '<label for="m-peso">Peso (kg)</label>'
  const pesoInput = document.createElement('input')
  pesoInput.type = 'number'
  pesoInput.id = 'm-peso'
  pesoInput.className = 'input'
  pesoInput.step = '0.1'
  pesoInput.placeholder = 'es. 77.8'
  pesoGroup.appendChild(pesoInput)
  body.appendChild(pesoGroup)

  const grid = document.createElement('div')
  grid.className = 'macro-input-grid'
  OPTIONAL_FIELDS.forEach((f) => {
    const g = document.createElement('div')
    g.className = 'input-group'
    g.innerHTML = `<label for="m-${f.key}">${f.label}</label>`
    const inp = document.createElement('input')
    inp.type = 'number'
    inp.id = `m-${f.key}`
    inp.className = 'input input-sm'
    inp.step = '0.5'
    g.appendChild(inp)
    grid.appendChild(g)
    inputs[f.key] = inp
  })
  body.appendChild(grid)

  const hint = document.createElement('p')
  hint.className = 'photo-result-hint'
  hint.textContent = 'Solo il peso è obbligatorio. Lascia vuoti i campi che non hai misurato.'
  body.appendChild(hint)

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const sLabel = document.createElement('span')
  sLabel.textContent = 'Salva misurazione'
  saveBtn.appendChild(sLabel)
  saveBtn.addEventListener('click', () => {
    const peso = Number(pesoInput.value)
    if (!pesoInput.value.trim() || !(peso > 0)) {
      pesoInput.style.borderColor = 'var(--error)'
      return
    }
    const m = { date: todayLabel(), peso }
    Object.entries(inputs).forEach(([key, inp]) => {
      const v = Number(inp.value)
      m[key] = inp.value.trim() ? v : (current && current[key] != null ? current[key] : 0)
    })
    onSave(m)
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

export { addMeasurementModal }
