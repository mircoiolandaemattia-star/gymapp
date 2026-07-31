import { createIcon } from '/src/utils/icons.js'
import { X, LogOut } from 'lucide'

function logoutConfirmModal({ onConfirm }) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })

  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.style.cssText = 'max-width:380px;align-self:center;border-radius:var(--radius-xl)'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = 'Esci da FitTrack'
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body'
  body.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;gap:var(--space-sm)'
  const iconBox = document.createElement('div')
  iconBox.className = 'plan-icon'
  iconBox.style.cssText = 'color:var(--error);background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.3)'
  iconBox.appendChild(createIcon(LogOut, 24, 2))
  body.appendChild(iconBox)
  const text = document.createElement('p')
  text.style.cssText = 'font-size:0.875rem;color:var(--text-secondary)'
  text.textContent = 'Sei sicuro di voler uscire? Dovrai accedere di nuovo per tornare.'
  body.appendChild(text)
  modal.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'modal-footer'
  footer.style.cssText = 'display:flex;gap:var(--space-sm)'
  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'btn btn-outline'
  cancelBtn.style.cssText = 'flex:1'
  cancelBtn.textContent = 'Annulla'
  cancelBtn.addEventListener('click', close)
  footer.appendChild(cancelBtn)
  const exitBtn = document.createElement('button')
  exitBtn.className = 'btn btn-error'
  exitBtn.style.cssText = 'flex:1'
  exitBtn.textContent = 'Esci'
  exitBtn.addEventListener('click', () => {
    close()
    if (onConfirm) onConfirm()
  })
  footer.appendChild(exitBtn)
  modal.appendChild(footer)

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    document.body.removeChild(overlay)
  }
}

export { logoutConfirmModal }
