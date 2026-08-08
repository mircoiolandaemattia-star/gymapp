import { createIcon } from '/src/utils/icons.js'
import { X, Lock, Crown, CheckCircle } from 'lucide'
import { navigate } from '/src/utils/router.js'
import { hasUsedTrial } from '/src/utils/premium.js'

const BENEFITS = [
  'Analisi foto pasti illimitate',
  'Generazione scheda con AI',
  'Generazione dieta con AI',
  'Caricamento file con lettura AI',
]

function premiumUpsellModal({ title, onClose } = {}) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  const modal = document.createElement('div')
  modal.className = 'modal up-modal'

  const header = document.createElement('div')
  header.className = 'modal-header'
  const hTitle = document.createElement('h2')
  hTitle.className = 'modal-title'
  hTitle.textContent = title || ''
  header.appendChild(hTitle)
  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close'
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  modal.appendChild(header)

  const body = document.createElement('div')
  body.className = 'modal-body up-body'

  const iconBox = document.createElement('div')
  iconBox.className = 'up-icon'
  iconBox.appendChild(createIcon(Lock, 28, 2))
  body.appendChild(iconBox)

  const titleEl = document.createElement('h3')
  titleEl.className = 'up-title'
  titleEl.textContent = 'Questa funzione richiede Premium'
  body.appendChild(titleEl)

  const sub = document.createElement('p')
  sub.className = 'up-sub'
  sub.textContent = 'Sblocca tutte le funzionalità AI con il piano Premium.'
  body.appendChild(sub)

  const list = document.createElement('ul')
  list.className = 'up-features'
  BENEFITS.forEach((text) => {
    const li = document.createElement('li')
    li.appendChild(createIcon(CheckCircle, 16, 2))
    const span = document.createElement('span')
    span.textContent = text
    li.appendChild(span)
    list.appendChild(li)
  })
  body.appendChild(list)

  const price = document.createElement('p')
  price.className = 'up-price'
  price.innerHTML = '25€<small>/anno</small> · primo mese gratis'
  body.appendChild(price)

  const cta = document.createElement('button')
  cta.className = 'btn btn-primary btn-full'
  cta.appendChild(createIcon(Crown, 16, 2))
  const ctaLabel = document.createElement('span')
  ctaLabel.textContent = hasUsedTrial() ? 'Passa a Premium' : 'Prova Premium gratis'
  cta.appendChild(ctaLabel)
  cta.addEventListener('click', () => {
    close()
    navigate('/profilo')
  })
  body.appendChild(cta)

  const back = document.createElement('button')
  back.className = 'btn btn-outline btn-full up-back'
  back.textContent = 'Torna indietro'
  back.addEventListener('click', close)
  body.appendChild(back)

  modal.appendChild(body)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function close() {
    if (overlay.parentNode) document.body.removeChild(overlay)
    if (onClose) onClose()
  }
}

export { premiumUpsellModal }