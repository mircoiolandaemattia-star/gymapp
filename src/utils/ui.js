import { createIcon } from '/src/utils/icons.js'
import { Loader, AlertTriangle } from 'lucide'

export function loadingEl(text) {
  const wrap = document.createElement('div')
  wrap.className = 'page-loading'
  const icon = createIcon(Loader, 26, 2)
  icon.classList.add('spin')
  wrap.appendChild(icon)
  const p = document.createElement('p')
  p.className = 'page-loading-text'
  p.textContent = text || 'Caricamento...'
  wrap.appendChild(p)
  return wrap
}

export function errorEl(message) {
  const card = document.createElement('div')
  card.className = 'card page-error'
  const icon = createIcon(AlertTriangle, 24, 1.5)
  icon.style.cssText = 'color:var(--error)'
  card.appendChild(icon)
  const p = document.createElement('p')
  p.className = 'page-error-text'
  p.textContent = message
  card.appendChild(p)
  const retry = document.createElement('button')
  retry.className = 'btn btn-primary'
  retry.textContent = 'Riprova'
  card.appendChild(retry)
  return { el: card, retry }
}
