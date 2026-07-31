import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { Home, Dumbbell, Apple, TrendingUp, User } from 'lucide'

const links = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/scheda', label: 'Scheda', icon: Dumbbell },
  { path: '/dieta', label: 'Dieta', icon: Apple },
  { path: '/progressi', label: 'Progressi', icon: TrendingUp },
  { path: '/profilo', label: 'Profilo', icon: User },
]

function bottomNav() {
  const nav = document.createElement('nav')
  nav.className = 'bottom-nav'

  const currentPath = window.location.pathname || '/'

  links.forEach(({ path, label, icon }) => {
    const btn = document.createElement('button')
    btn.className = 'nav-item' + (currentPath === path ? ' active' : '')
    btn.setAttribute('aria-label', label)
    const svg = createIcon(icon, 24, 1.5)
    svg.setAttribute('width', '22')
    svg.setAttribute('height', '22')
    btn.appendChild(svg)
    const span = document.createElement('span')
    span.className = 'nav-label'
    span.textContent = label
    btn.appendChild(span)
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      navigate(path)
    })
    nav.appendChild(btn)
  })

  return nav
}

export { bottomNav }
