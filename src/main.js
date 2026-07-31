import '/src/styles/base.css'
import { router, isActiveWorkout } from '/src/utils/router.js'
import { bottomNav } from '/src/components/bottomNav.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const app = document.getElementById('app')

const AUTH_PATHS = ['/login', '/register', '/onboarding']

function render() {
  app.innerHTML = ''
  const page = document.createElement('div')
  page.id = 'page-content'
  app.appendChild(page)
  router(page)
  const path = window.location.pathname || '/'
  if (!isActiveWorkout() && !AUTH_PATHS.includes(path)) {
    app.appendChild(bottomNav())
  }
}

window.addEventListener('popstate', render)
render()
