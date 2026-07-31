import '/src/styles/base.css'
import { router, isActiveWorkout } from '/src/utils/router.js'
import { bottomNav } from '/src/components/bottomNav.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const app = document.getElementById('app')

function render() {
  app.innerHTML = ''
  const page = document.createElement('div')
  page.id = 'page-content'
  app.appendChild(page)
  router(page)
  if (!isActiveWorkout()) {
    app.appendChild(bottomNav())
  }
}

render()

window.addEventListener('popstate', render)
