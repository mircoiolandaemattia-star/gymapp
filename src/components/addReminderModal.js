import { createIcon } from '/src/utils/icons.js'
import { X, Save } from 'lucide'

function addReminderModal({ onSave }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })

  const modal = document.createElement('div')
  modal.className = 'modal'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Aggiungi promemoria'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'

  const timeGroup = document.createElement('div')
  timeGroup.className = 'input-group'
  timeGroup.innerHTML = '<label for="r-time">Ora</label>'
  const timeInput = document.createElement('input')
  timeInput.type = 'time'
  timeInput.id = 'r-time'
  timeInput.className = 'input'
  timeInput.value = '08:00'
  timeGroup.appendChild(timeInput)
  body.appendChild(timeGroup)

  const labelGroup = document.createElement('div')
  labelGroup.className = 'input-group'
  labelGroup.innerHTML = '<label for="r-label">Etichetta</label>'
  const labelInput = document.createElement('input')
  labelInput.type = 'text'
  labelInput.id = 'r-label'
  labelInput.className = 'input'
  labelInput.placeholder = 'es. Pesata mattutina'
  labelInput.maxLength = 40
  labelGroup.appendChild(labelInput)
  body.appendChild(labelGroup)

  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  const saveBtn = document.createElement('button')
  saveBtn.className = 'btn btn-primary btn-full'
  saveBtn.appendChild(createIcon(Save, 16, 2))
  const s = document.createElement('span')
  s.textContent = 'Salva promemoria'
  saveBtn.appendChild(s)
  saveBtn.addEventListener('click', () => {
    const time = timeInput.value
    const label = labelInput.value.trim()
    if (!time) {
      timeInput.style.borderColor = 'var(--error)'
      return
    }
    onSave({ id: 'r' + Date.now(), time, label: label || 'Promemoria', enabled: true })
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

export { addReminderModal }
