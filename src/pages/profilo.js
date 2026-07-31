import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { User, Target, Calendar, Settings, ChevronRight, LogOut } from 'lucide'

function render() {
  const section = document.createElement('section')
  section.className = 'page profilo-page'

  const header = document.createElement('div')
  header.className = 'page-header'
  header.innerHTML = `
    <h1 class="page-title">Profilo</h1>
    <p class="page-subtitle">Le tue impostazioni</p>
  `
  section.appendChild(header)

  const avatar = document.createElement('div')
  avatar.className = 'avatar'
  avatar.appendChild(createIcon(User, 40, 1.5))
  section.appendChild(avatar)

  const name = document.createElement('h2')
  name.className = 'profile-name'
  name.textContent = 'Mario Rossi'
  section.appendChild(name)

  const menuItems = [
    { icon: Target, label: 'Obiettivi' },
    { icon: Calendar, label: 'Storico Allenamenti' },
    { icon: Settings, label: 'Impostazioni' },
  ]

  const menu = document.createElement('div')
  menu.className = 'profile-menu'

  menuItems.forEach((item) => {
    const el = document.createElement('div')
    el.className = 'card menu-item'
    el.appendChild(createIcon(item.icon, 20, 2))
    const span = document.createElement('span')
    span.style.cssText = 'flex:1;font-size:0.875rem'
    span.textContent = item.label
    el.appendChild(span)
    const ch = createIcon(ChevronRight, 16, 2)
    ch.style.cssText = 'color:var(--text-muted);flex-shrink:0'
    el.appendChild(ch)
    menu.appendChild(el)
  })

  section.appendChild(menu)

  const logoutBtn = document.createElement('button')
  logoutBtn.className = 'btn btn-error btn-full'
  logoutBtn.style.cssText = 'margin-top:var(--space-2xl);width:100%;display:inline-flex;align-items:center;justify-content:center;gap:var(--space-sm)'
  logoutBtn.appendChild(createIcon(LogOut, 18, 2))
  const logSpan = document.createElement('span')
  logSpan.textContent = 'Esci'
  logoutBtn.appendChild(logSpan)
  logoutBtn.addEventListener('click', () => navigate('/login'))
  section.appendChild(logoutBtn)

  return section
}

export { render }
export default render
