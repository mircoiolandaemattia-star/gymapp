import { createIcon } from '/src/utils/icons.js'
import { Moon, Bell, Globe, ChevronRight } from 'lucide'

function toggleBtn(on) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'toggle' + (on ? ' on' : '')
  btn.setAttribute('aria-pressed', String(on))
  btn.setAttribute('role', 'switch')
  return btn
}

function settingsCard({ darkMode, notifications, onToggleTheme, onToggleNotifications, onLanguage }) {
  const card = document.createElement('div')
  card.className = 'card'

  const title = document.createElement('h3')
  title.className = 'card-title'
  title.textContent = 'Impostazioni'
  card.appendChild(title)

  const themeRow = document.createElement('div')
  themeRow.className = 'setting-row'
  themeRow.style.cssText = 'margin-top:var(--space-sm)'
  const themeIcon = document.createElement('div')
  themeIcon.className = 'setting-icon'
  themeIcon.appendChild(createIcon(Moon, 16, 2))
  themeRow.appendChild(themeIcon)
  const themeLabel = document.createElement('span')
  themeLabel.className = 'setting-label'
  themeLabel.textContent = 'Modalità scura'
  themeRow.appendChild(themeLabel)
  const themeToggle = toggleBtn(darkMode)
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    onToggleTheme()
  })
  themeRow.appendChild(themeToggle)
  themeRow.addEventListener('click', onToggleTheme)
  card.appendChild(themeRow)

  const notifRow = document.createElement('div')
  notifRow.className = 'setting-row'
  const notifIcon = document.createElement('div')
  notifIcon.className = 'setting-icon'
  notifIcon.style.cssText = 'color:var(--warning)'
  notifIcon.appendChild(createIcon(Bell, 16, 2))
  notifRow.appendChild(notifIcon)
  const notifLabel = document.createElement('span')
  notifLabel.className = 'setting-label'
  notifLabel.textContent = 'Notifiche'
  notifRow.appendChild(notifLabel)
  const notifToggle = toggleBtn(notifications)
  notifToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    onToggleNotifications()
  })
  notifRow.appendChild(notifToggle)
  notifRow.addEventListener('click', onToggleNotifications)
  card.appendChild(notifRow)

  const langRow = document.createElement('div')
  langRow.className = 'setting-row'
  const langIcon = document.createElement('div')
  langIcon.className = 'setting-icon'
  langIcon.style.cssText = 'color:var(--accent)'
  langIcon.appendChild(createIcon(Globe, 16, 2))
  langRow.appendChild(langIcon)
  const langLabel = document.createElement('span')
  langLabel.className = 'setting-label'
  langLabel.textContent = 'Lingua'
  langRow.appendChild(langLabel)
  const langValue = document.createElement('span')
  langValue.className = 'setting-value'
  langValue.textContent = 'Italiano'
  langRow.appendChild(langValue)
  const chev = createIcon(ChevronRight, 16, 2)
  chev.style.cssText = 'color:var(--text-muted)'
  langRow.appendChild(chev)
  langRow.addEventListener('click', onLanguage)
  card.appendChild(langRow)

  return card
}

export { settingsCard }
