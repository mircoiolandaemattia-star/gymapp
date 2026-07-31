const PRECACHE_URLS = __PRECACHE_URLS__
const CACHE_NAME = 'fittrack-__VERSION__'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
    })()
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request))
    return
  }

  event.respondWith(cacheFirst(request))
})

async function networkFirstWithShellFallback(request) {
  let response
  try {
    response = await fetch(request)
  } catch {
    return serveShell(request)
  }
  if (response.ok) {
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.put(request, response.clone()))
      .catch(() => {})
  }
  return response
}

async function serveShell(request) {
  const cached = (await caches.match(request)) || (await caches.match('/')) || (await caches.match('/index.html'))
  if (!cached) {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  if (!cached.redirected) return cached
  return new Response(cached.body, {
    status: cached.status,
    statusText: cached.statusText,
    headers: cached.headers,
  })
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
