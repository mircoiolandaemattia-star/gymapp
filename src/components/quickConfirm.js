import { createIcon } from '/src/utils/icons.js'
import { X } from 'lucide'

export function quickConfirm({ message, confirmText = 'Rimuovi', onConfirm }) {
  document.querySelectorAll('.confirm-overlay').forEach((el) => el.remove())

  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay confirm-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal modal-sm confirm-pop'

  const body = document.createElement('div')
  body.className = 'modal-body'

  const txt = document.createElement('p')
  txt.className = 'confirm-text'
  txt.textContent = message || 'Confermi?'
  body.appendChild(txt)

  const row = document.createElement('div')
  row.className = 'confirm-actions'

  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'btn btn-outline'
  const cLabel = document.createElement('span')
  cLabel.textContent = 'Annulla'
  cancelBtn.appendChild(cLabel)
  cancelBtn.addEventListener('click', close)
  row.appendChild(cancelBtn)

  const okBtn = document.createElement('button')
  okBtn.className = 'btn btn-danger'
  const oLabel = document.createElement('span')
  oLabel.textContent = confirmText
  okBtn.appendChild(oLabel)
  okBtn.addEventListener('click', () => {
    close()
    if (onConfirm) onConfirm()
  })
  row.appendChild(okBtn)

  body.appendChild(row)
  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}