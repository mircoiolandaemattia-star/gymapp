const pages = {
  home: () => import('/src/pages/home.js'),
  scheda: () => import('/src/pages/scheda.js'),
  dieta: () => import('/src/pages/dieta.js'),
  progressi: () => import('/src/pages/progressi.js'),
  profilo: () => import('/src/pages/profilo.js'),
  login: () => import('/src/pages/login.js'),
  register: () => import('/src/pages/register.js'),
  onboarding: () => import('/src/pages/onboarding.js'),
  activeWorkout: () => import('/src/pages/activeWorkout.js'),
}

const routes = {
  '/': 'home',
  '/scheda': 'scheda',
  '/dieta': 'dieta',
  '/progressi': 'progressi',
  '/profilo': 'profilo',
  '/login': 'login',
  '/register': 'register',
  '/onboarding': 'onboarding',
}

function resolvePath(path) {
  if (routes[path]) return routes[path]
  if (path.startsWith('/scheda/allenamento/')) return 'activeWorkout'
  return 'home'
}

function isActiveWorkout() {
  return window.location.pathname.startsWith('/scheda/allenamento/')
}

async function router(container) {
  const path = window.location.pathname || '/'
  const pageName = resolvePath(path)

  try {
    const loader = pages[pageName]
    if (!loader) throw new Error(`Page not found: ${pageName}`)
    const module = await loader()
    const page = module.default || module.render
    if (typeof page === 'function') {
      container.appendChild(page())
    } else {
      container.appendChild(page)
    }
  } catch (err) {
    console.error('Router error:', err)
    const h2 = document.createElement('h2')
    h2.textContent = 'Pagina non trovata'
    container.appendChild(h2)
  }
}

function navigate(path) {
  window.history.pushState({}, '', path)
  const event = new PopStateEvent('popstate')
  window.dispatchEvent(event)
}

export { router, navigate, isActiveWorkout }
