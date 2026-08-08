import { storage } from '/src/utils/storage.js'
import { createIcon } from '/src/utils/icons.js'
import { X, Download, Share, Plus, Check, MoreVertical } from 'lucide'

const KEY = 'ft_install'
const REMIND_DAYS = 14
let deferredPrompt = null
let overlay = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  storage.set(KEY, { installed: true })
})

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true
  )
}

function detect() {
  const ua = navigator.userAgent
  const ios = /iphone|ipad|ipod/i.test(ua)
  const android = /android/i.test(ua)
  return {
    ios,
    android,
    desktop: !ios && !android,
    installableBrowser: !!deferredPrompt,
  }
}

function buildContent(plat) {
  const wrap = document.createElement('div')
  wrap.className = 'install-content'

  if (plat.installableBrowser) {
    const hint = document.createElement('p')
    hint.className = 'install-hint'
    hint.textContent =
      'Il tuo browser supporta l\'installazione diretta. Premendo il bottone sotto l\'app verrà aggiunta al tuo sistema.'
    wrap.appendChild(hint)
    return wrap
  }

  const steps = plat.ios
    ? [
        { icon: Share, text: 'Apri FitTrack nel browser Safari' },
        { icon: Share, text: 'Tocca Condividi (la freccia verso l\'alto)' },
        { icon: Plus, text: 'Scorri e scegli "Aggiungi a Home"' },
        { icon: Check, text: 'Conferma con "Aggiungi"' },
      ]
    : plat.android
      ? [
          { icon: MoreVertical, text: 'Apri FitTrack nel browser Chrome' },
          { icon: MoreVertical, text: 'Tocca i tre puntini ⋮ in alto' },
          { icon: Plus, text: 'Scegli "Aggiungi a schermata Home" o "Installa app"' },
          { icon: Check, text: 'Conferma l\'installazione' },
        ]
      : [
          { icon: Download, text: 'Usa Chrome o Edge per aprire questo sito' },
          { icon: Download, text: 'Cerca l\'icona "Installa" nella barra degli indirizzi' },
          { icon: Plus, text: 'Conferma per creare l\'icona sul desktop' },
        ]

  steps.forEach((s, i) => {
    const row = document.createElement('div')
    row.className = 'install-step'
    const num = document.createElement('span')
    num.className = 'install-step-num'
    num.textContent = String(i + 1)
    row.appendChild(num)
    const iconWrap = document.createElement('span')
    iconWrap.className = 'install-step-icon'
    iconWrap.appendChild(createIcon(s.icon, 16, 2))
    row.appendChild(iconWrap)
    const txt = document.createElement('span')
    txt.className = 'install-step-text'
    txt.textContent = s.text
    row.appendChild(txt)
    wrap.appendChild(row)
  })

  return wrap
}

function hide() {
  if (overlay && overlay.parentNode) document.body.removeChild(overlay)
  overlay = null
}

function dismiss() {
  storage.set(KEY, { dismissedAt: new Date().toISOString() })
  hide()
}

function showInstall(plat) {
  if (document.querySelector('.install-overlay')) return
  if (overlay) hide()

  overlay = document.createElement('div')
  overlay.className = 'install-overlay'

  const panel = document.createElement('div')
  panel.className = 'install-panel'

  const closeBtn = document.createElement('button')
  closeBtn.className = 'modal-close install-close'
  closeBtn.setAttribute('aria-label', 'Chiudi')
  closeBtn.appendChild(createIcon(X, 20, 2))
  closeBtn.addEventListener('click', dismiss)
  panel.appendChild(closeBtn)

  const logo = document.createElement('img')
  logo.className = 'install-logo'
  logo.src = '/icon-192.png'
  logo.alt = 'FitTrack'
  panel.appendChild(logo)

  const title = document.createElement('h2')
  title.className = 'install-title'
  title.textContent = plat.desktop ? 'FitTrack' : 'Installa FitTrack'
  panel.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'install-subtitle'
  if (plat.desktop) {
    subtitle.textContent =
      'La versione desktop è in sola lettura. Per allenarti, registrare pasti e usare tutte le funzioni installa FitTrack sul tuo telefono.'
  } else {
    subtitle.textContent =
      'Aggiungi FitTrack alla tua schermata iniziale e aprilo come una vera app, senza App Store.'
  }
  panel.appendChild(subtitle)

  if (plat.desktop) {
    const box = document.createElement('div')
    box.className = 'install-readonly'
    box.textContent = 'Modalità sola lettura: su desktop puoi consultare piani e dati, ma non modificarli.'
    panel.appendChild(box)
  } else {
    const card = document.createElement('div')
    card.className = 'install-card'
    card.appendChild(buildContent(plat))
    panel.appendChild(card)
  }

  const actions = document.createElement('div')
  actions.className = 'install-actions'

  if (plat.installableBrowser) {
    const primary = document.createElement('button')
    primary.className = 'btn btn-primary btn-full'
    primary.appendChild(createIcon(Download, 16, 2))
    const pLabel = document.createElement('span')
    pLabel.textContent = 'Installa ora'
    primary.appendChild(pLabel)
    primary.addEventListener('click', () => {
      if (!deferredPrompt) {
        hide()
        return
      }
      deferredPrompt.prompt()
      deferredPrompt.userChoice.finally(() => {
        deferredPrompt = null
      })
      hide()
    })
    actions.appendChild(primary)
  }

  if (!plat.desktop) {
    const later = document.createElement('button')
    later.className = 'install-later'
    later.textContent = 'Non ora'
    later.addEventListener('click', dismiss)
    actions.appendChild(later)
  } else {
    const ok = document.createElement('button')
    ok.className = 'install-later'
    ok.textContent = 'Ho capito'
    ok.addEventListener('click', dismiss)
    actions.appendChild(ok)
  }

  panel.appendChild(actions)
  overlay.appendChild(panel)
  document.body.appendChild(overlay)
}

export function maybeShowInstallPrompt({ force = false } = {}) {
  if (typeof window === 'undefined') return
  if (isStandalone()) return

  const saved = storage.get(KEY) || {}
  if (saved.installed) return
  if (!force && saved.dismissedAt) {
    const days = (Date.now() - new Date(saved.dismissedAt).getTime()) / 86400000
    if (days < REMIND_DAYS) return
  }

  showInstall(detect())
}