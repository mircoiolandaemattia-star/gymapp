import { createIcon } from '/src/utils/icons.js'
import { Crown, CheckCircle, Info } from 'lucide'

function daysUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function featureList(items) {
  const ul = document.createElement('ul')
  ul.className = 'plan-features'
  items.forEach((text) => {
    const li = document.createElement('li')
    li.appendChild(createIcon(CheckCircle, 16, 2))
    const span = document.createElement('span')
    span.textContent = text
    li.appendChild(span)
    ul.appendChild(li)
  })
  return ul
}

function subscriptionCard({ plan, onTrial, onUpgrade, onCancel }) {
  const card = document.createElement('div')
  card.className = 'card plan-card'

  const icon = document.createElement('div')
  icon.className = 'plan-icon'
  icon.appendChild(createIcon(Crown, 24, 2))
  card.appendChild(icon)

  if (plan.tier === 'trial') {
    const title = document.createElement('h4')
    title.className = 'plan-title'
    title.textContent = 'Prova Premium'
    card.appendChild(title)
    const sub = document.createElement('p')
    sub.className = 'plan-subtitle'
    sub.textContent = '30 giorni di prova gratuita'
    card.appendChild(sub)
    const countdown = document.createElement('span')
    countdown.className = 'plan-countdown'
    countdown.appendChild(createIcon(Info, 12, 2))
    const cd = document.createElement('span')
    cd.textContent = `${daysUntil(plan.trialEnd)} giorni rimasti`
    countdown.appendChild(cd)
    card.appendChild(countdown)
    card.appendChild(featureList([
      'Analisi foto illimitate',
      'Dieta generata con AI',
      'Piani di allenamento avanzati',
      'Statistiche dettagliate',
    ]))
    const actions = document.createElement('div')
    actions.className = 'plan-actions'
    const upBtn = document.createElement('button')
    upBtn.className = 'btn btn-primary btn-full'
    upBtn.appendChild(createIcon(Crown, 16, 2))
    const ub = document.createElement('span')
    ub.textContent = 'Passa a Premium · 25€/anno'
    upBtn.appendChild(ub)
    upBtn.addEventListener('click', onUpgrade)
    actions.appendChild(upBtn)
    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'btn btn-outline btn-full'
    cancelBtn.textContent = 'Torna al piano Free'
    cancelBtn.addEventListener('click', onCancel)
    actions.appendChild(cancelBtn)
    card.appendChild(actions)
  } else if (plan.tier === 'premium') {
    const title = document.createElement('h4')
    title.className = 'plan-title'
    title.textContent = 'Premium'
    card.appendChild(title)
    const sub = document.createElement('p')
    sub.className = 'plan-subtitle'
    sub.textContent = 'Grazie per essere Premium!'
    card.appendChild(sub)
    const status = document.createElement('span')
    status.className = 'plan-countdown'
    status.appendChild(createIcon(CheckCircle, 12, 2))
    const st = document.createElement('span')
    st.textContent = 'Abbonamento attivo'
    status.appendChild(st)
    card.appendChild(status)
    const renew = document.createElement('p')
    renew.className = 'plan-subtitle'
    renew.style.cssText = 'margin:var(--space-md) 0 0'
    renew.textContent = plan.renewDate
      ? `Rinnovo automatico il ${formatDate(plan.renewDate)}`
      : 'Rinnovo automatico attivo'
    card.appendChild(renew)
    const actions = document.createElement('div')
    actions.className = 'plan-actions'
    actions.style.cssText = 'margin-top:var(--space-md)'
    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'btn btn-error btn-full'
    cancelBtn.textContent = 'Annulla abbonamento'
    cancelBtn.addEventListener('click', onCancel)
    actions.appendChild(cancelBtn)
    card.appendChild(actions)
  } else {
    const title = document.createElement('h4')
    title.className = 'plan-title'
    title.textContent = 'FitTrack Premium'
    card.appendChild(title)
    const sub = document.createElement('p')
    sub.className = 'plan-subtitle'
    sub.textContent = 'Sblocca funzionalità illimitate'
    card.appendChild(sub)
    const price = document.createElement('p')
    price.className = 'plan-price'
    price.innerHTML = '25€<small>/anno</small>'
    card.appendChild(price)
    card.appendChild(featureList([
      'Analisi foto illimitate',
      'Dieta generata con AI',
      'Piani di allenamento avanzati',
      'Statistiche dettagliate',
    ]))
    const actions = document.createElement('div')
    actions.className = 'plan-actions'
    const trialBtn = document.createElement('button')
    trialBtn.className = 'btn btn-primary btn-full'
    trialBtn.appendChild(createIcon(Crown, 16, 2))
    const tb = document.createElement('span')
    tb.textContent = plan.hasTrial ? 'Passa a Premium · 25€/anno' : 'Prova gratis 30 giorni'
    trialBtn.appendChild(tb)
    trialBtn.addEventListener('click', plan.hasTrial ? onUpgrade : onTrial)
    actions.appendChild(trialBtn)
    const current = document.createElement('span')
    current.className = 'plan-current'
    current.textContent = plan.hasTrial ? 'Trial gi\u00e0 utilizzato' : 'Piano attuale: Free'
    actions.appendChild(current)
    card.appendChild(actions)
  }

  return card
}

export { subscriptionCard }
