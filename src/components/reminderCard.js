import { createIcon } from '/src/utils/icons.js'
import { Bell, Plus, Trash2 } from 'lucide'

function toggleBtn(on) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'toggle' + (on ? ' on' : '')
  btn.setAttribute('aria-pressed', String(on))
  btn.setAttribute('role', 'switch')
  return btn
}

function reminderCard({ reminders, onAdd, onToggle, onRemove }) {
  const card = document.createElement('div')
  card.className = 'card'

  const head = document.createElement('div')
  head.className = 'section-header'
  head.style.cssText = 'margin-bottom:var(--space-sm)'
  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Promemoria'
  head.appendChild(title)
  const addBtn = document.createElement('button')
  addBtn.className = 'card-add-btn reminder-add-btn'
  addBtn.setAttribute('aria-label', 'Aggiungi promemoria')
  addBtn.appendChild(createIcon(Plus, 18, 2))
  addBtn.addEventListener('click', onAdd)
  head.appendChild(addBtn)
  card.appendChild(head)

  if (!reminders.length) {
    const empty = document.createElement('p')
    empty.className = 'reminder-empty'
    empty.textContent = 'Nessun promemoria. Aggiungine uno!'
    card.appendChild(empty)
  }

  reminders.forEach((r) => {
    const row = document.createElement('div')
    row.className = 'reminder-row'

    const iconBox = document.createElement('div')
    iconBox.className = 'reminder-icon'
    iconBox.appendChild(createIcon(Bell, 16, 2))
    row.appendChild(iconBox)

    const time = document.createElement('span')
    time.className = 'reminder-time'
    time.textContent = r.time
    row.appendChild(time)

    const label = document.createElement('span')
    label.className = 'reminder-label'
    label.textContent = r.label
    row.appendChild(label)

    const tgl = toggleBtn(r.enabled)
    tgl.addEventListener('click', (e) => {
      e.stopPropagation()
      onToggle(r.id)
    })
    row.appendChild(tgl)

    const del = document.createElement('button')
    del.className = 'reminder-delete'
    del.setAttribute('aria-label', 'Elimina promemoria')
    del.appendChild(createIcon(Trash2, 16, 2))
    del.addEventListener('click', () => onRemove(r.id))
    row.appendChild(del)

    card.appendChild(row)
  })

  return card
}

export { reminderCard }
